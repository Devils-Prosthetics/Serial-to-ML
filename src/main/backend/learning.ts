/// <reference types="vite/client" />
import * as tf from '@tensorflow/tfjs'
import * as fs from 'fs'
import config from '../../config.json'
import { Worker } from 'node:worker_threads'
import fitModel from './fit_model.js?raw'
import path from 'path'

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

export const train = (): Promise<[number, number, NormalizationOptions, string[], number]> => {
	return new Promise((resolve, reject) => {
		try {
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

			const normalized = normalize(features)
			normalizedTrainingInfo = normalized.info
			features = normalized.data

			const workerData: FitModelInput = {
				features,
				labels,
				labelsNames,
				model_location: config.model_location
			}

			const worker = new Worker(fitModel, {
				workerData,
				eval: true
			})

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

export const test = async (
	value: string
): Promise<{ prediction: string; probabilities: number[] }> => {
	const saveLocation = path.resolve(config.model_location, 'model.json')
	const model = await tf.loadLayersModel(`file://${saveLocation}`)

	const numbers = value.split(',').map((item) => parseFloat(item.trim()))
	const normalized = normalize([numbers], normalizedTrainingInfo)

	console.log(normalized.data)

	const predictions = model!.predict(tf.tensor2d(normalized.data)) as tf.Tensor

	return {
		prediction: labelsNames[predictions.argMax(1).dataSync()[0]],
		probabilities: predictions.arraySync()[0] as number[]
	}
}

export const resetTraining = (): void => {
	labelsNames = []
	normalizedTrainingInfo = undefined
}

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

const returnLabelNumbers = (label: string): number => {
	label = label.replace(/(\r\n|\n|\r)/gm, '')
	if (!labelsNames.includes(label)) labelsNames.push(label)
	return labelsNames.indexOf(label)
}
