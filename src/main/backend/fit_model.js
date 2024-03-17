const { parentPort, workerData } = require('worker_threads')
const tf = require('@tensorflow/tfjs')
const seedrandom = require('seedrandom')
const path = require('path')

/**
 * Split the features and labels into train and test sets
 * @param {Array} X - The features
 * @param {Array} y - The labels
 * @param {number} testSize - The size of the test set
 * @param {number} randomState - The random seed
 * @returns {Array} - The train and test sets
 * @example
 * const X = [[1, 2], [3, 4], [5, 6], [7, 8]]
 * const y = [0, 1, 0, 1]
 * const [XTrain, XTest, yTrain, yTest] = trainTestSplit(X, y, 0.2, 42)
 * console.log(XTrain) // [[5, 6], [1, 2], [7, 8]]
 * console.log(XTest) // [[3, 4]]
 * console.log(yTrain) // [0, 0, 1]
 * console.log(yTest) // [1]
 */
const trainTestSplit = (X, y, testSize = 0.2, randomState = undefined) => {
	const rng = seedrandom(randomState)
	// Combine X and y into a single array
	const data = X.map((x, i) => [x, y[i]])

	// Shuffle the data using Fisher-Yates shuffle algorithm
	for (let i = data.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		;[data[i], data[j]] = [data[j], data[i]]
	}

	// Calculate the split index
	const splitIndex = Math.floor(data.length * (1 - testSize))

	// Split the data into train and test sets
	const XTrain = data.slice(0, splitIndex).map((d) => d[0])
	const yTrain = data.slice(0, splitIndex).map((d) => d[1])
	const XTest = data.slice(splitIndex).map((d) => d[0])
	const yTest = data.slice(splitIndex).map((d) => d[1])

	return [XTrain, XTest, yTrain, yTest]
}

// Get the features, labels, labelsNames and model location from the worker data
const { features, labels, labelsNames, model_location } = workerData

// Split the features and labels into train and test sets
const [XTrain, XTest, yTrain, yTest] = trainTestSplit(features, labels)

// Convert the features and labels into tensors
const XTrainTensor = tf.tensor(XTrain)
const yTrainTensor = tf.tensor(yTrain)

const XTestTensor = tf.tensor(XTest)
const yTestTensor = tf.tensor(yTest)

// Define the model architecture
const model = tf.sequential()
model.add(tf.layers.dense({ units: 512, activation: 'relu', inputShape: [features[0].length] }))
model.add(tf.layers.dense({ units: 512, activation: 'relu' }))
model.add(tf.layers.dense({ units: 128, activation: 'relu' }))
model.add(tf.layers.dense({ units: labelsNames.length, activation: 'softmax' }))

// Compile the model
model.compile({
	optimizer: 'adam',
	loss: 'sparseCategoricalCrossentropy',
	metrics: ['accuracy']
})

// Create variable to store the best weights
let bestWeights = null
let bestValLoss = Number.POSITIVE_INFINITY

// Custom callback to store best weights
const customCallback = {
	onEpochEnd: async (_, logs) => {
		if (logs.val_loss < bestValLoss) {
			bestValLoss = logs.val_loss
			bestWeights = model.getWeights()
		}
	}
}

// Train the model
model
	.fit(XTrainTensor, yTrainTensor, {
		epochs: 50,
		validationData: [XTestTensor, yTestTensor], // Use the test set as the validation set
		callbacks: [customCallback], 				// Use the custom callback
		verbose: false
	})
	.then(() => {
		// Set the best weights
		if (bestWeights) {
			model.setWeights(bestWeights)
		}

		// Evaluate the model
		const result = model.evaluate(XTestTensor, yTestTensor)
		const loss = result[0].dataSync()[0]
		const accuracy = result[1].dataSync()[0]

		// Save the model
		const saveLocation = path.resolve(model_location)
		model.save(`file://${saveLocation}`)

		// Send the loss and accuracy to the parent thread
		parentPort?.postMessage({ loss, accuracy })
	})
