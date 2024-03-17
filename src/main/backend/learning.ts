/// <reference types="vite/client" />
import * as tf from '@tensorflow/tfjs'
import * as fs from 'fs'
import config from '../../config.json'
import { Worker } from 'node:worker_threads'
import fitModel from './fit_model.js?raw'
import path from 'path'

// Types
interface NormalizationOptions {
	median?: number
	iqr?: number // Interquartile Range
}

export type FitModelInput = {
	features: number[][]
	labels: number[]
	labelsNames: string[]
	model_location: string
}

export type FitModelOutput = {
	accuracy: number
	loss: number
}

let labelsNames: string[] = []
let normalizedTrainingInfo: NormalizationOptions | undefined

/**
 * Train a model using the provided CSV file
 * @returns Promise<[number, number, NormalizationOptions, string[], number]> - Loss, Accuracy, Normalization Info, Labels, Number of Features
 * @throws Error
 * @async
 * @example
 * const [loss, accuracy, info, labels, numFeatures] = await train()
 * console.log(`Loss: ${loss}, Accuracy: ${accuracy}, Normalization Info: ${info}, Labels: ${labels}, Number of Features: ${numFeatures}`)
 * // Output: Loss: 0.1, Accuracy: 0.9, Normalization Info: {median: 0, iqr: 1}, Labels: ['A', 'B', 'C'], Number of Features: 4
 */
export const train = (): Promise<[number, number, NormalizationOptions, string[], number]> => {
	// Return a promise to allow for async operations
	return new Promise((resolve, reject) => {
		try {
			// Reset the labels and training info variables
			labelsNames = []
			normalizedTrainingInfo = undefined

			// Load the CSV file into memory
			const data = fs
				.readFileSync(config.file_location, 'utf-8')
				.trim()
				.split('\n')
				.map((row) => row.split(','))

			// Split the data into features and labels
			const labels = data.map((row) => returnLabelNumbers(row[row.length - 1]))
			let features = data.map((row) => row.slice(0, -1).map(parseFloat))

			// Normalize the features
			const normalized = normalize(features)
			normalizedTrainingInfo = normalized.info
			features = normalized.data

			// Define data to send to the worker
			const workerData: FitModelInput = {
				features,
				labels,
				labelsNames,
				model_location: config.model_location
			}

			// Create a new worker and send the data
			const worker = new Worker(fitModel, {
				workerData,
				eval: true
			})

			// Handle the worker's message of completion
			worker.on('message', (data: FitModelOutput) => {
				console.log('message recieved')
				resolve([
					data.loss,
					data.accuracy,
					normalized.info,
					labelsNames,
					features[0].length
				])
			})
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Test the model using the provided value
 * @param value - The value to test
 * @returns Promise<{ prediction: string, probabilities: number[] }> - The prediction and the probabilities
 * @throws Error
 * @async
 * @example
 * const { prediction, probabilities } = await test('1, 2, 3, 4')
 * console.log(`Prediction: ${prediction}, Probabilities: ${probabilities}`)
 * // Output: Prediction: 'A', Probabilities: [0.1, 0.2, 0.3, 0.4]
 */
export const test = async (
	value: string
): Promise<{ prediction: string; probabilities: number[] }> => {
	// Load the model from the file system
	const saveLocation = path.resolve(config.model_location, 'model.json')
	const model = await tf.loadLayersModel(`file://${saveLocation}`)

	// Normalize the value from the user
	const numbers = value.split(',').map((item) => parseFloat(item.trim()))
	const normalized = normalize([numbers], normalizedTrainingInfo)

	console.log(normalized.data)

	// Make a prediction
	const predictions = model!.predict(tf.tensor2d(normalized.data)) as tf.Tensor

	// Return the prediction and the probabilities
	return {
		prediction: labelsNames[predictions.argMax(1).dataSync()[0]],
		probabilities: predictions.arraySync()[0] as number[]
	}
}

// Reset the training variables
export const resetTraining = (): void => {
	labelsNames = []
	normalizedTrainingInfo = undefined
}

/**
 * Normalize the provided data
 * @param data - The data to normalize
 * @param options - The options to use for normalization
 * @returns { data: number[][], info: NormalizationOptions } - The normalized data and the normalization info
 * @example
 * const { data, info } = normalize([[1, 2, 3], [4, 5, 6]])
 * console.log(`Data: ${data}, Info: ${info}`)
 */
function normalize(
	data: number[][],
	options: NormalizationOptions = {}
): { data: number[][]; info: NormalizationOptions } {
	// Flatten the data for calculations
	const flatData = data.flat()

	// Sort the flattened data
	const sortedData = [...flatData].sort((a, b) => a - b)

	// Determine the median and IQR either from options or by calculating them
	const median =
		options.median !== undefined
			? options.median
			: sortedData[Math.floor(sortedData.length / 2)]
	const q1 = sortedData[Math.floor(sortedData.length / 4)]
	const q3 = sortedData[Math.floor((3 * sortedData.length) / 4)]
	const iqr = options.iqr !== undefined ? options.iqr : q3 - q1

	// Robust scaling
	const scaledData: number[][] = data.map((row) => row.map((val) => (val - median) / iqr))

	return { data: scaledData, info: { median, iqr } }
}

/**
 * Return the index of the label
 * @param label - The label to return the index of
 * @returns number - The index of the label
 * @example
 * const index = returnLabelNumbers('A')
 * console.log(`Index: ${index}`)
 * // Output: Index: 0
 */
const returnLabelNumbers = (label: string): number => {
	label = label.replace(/(\r\n|\n|\r)/gm, '') // Remove any new lines
	if (!labelsNames.includes(label)) labelsNames.push(label) // Add the label to the labels array
	return labelsNames.indexOf(label) // Return the index of the label
}
