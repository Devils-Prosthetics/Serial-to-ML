const { parentPort, workerData } = require('worker_threads')
const tf = require('@tensorflow/tfjs')
const seedrandom = require('seedrandom')
const path = require('path')

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

const { features, labels, labelsNames, model_location } = workerData

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

model.compile({
	optimizer: 'adam',
	loss: 'sparseCategoricalCrossentropy',
	metrics: ['accuracy']
})

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
		validationData: [XTestTensor, yTestTensor],
		callbacks: [customCallback],
		verbose: false
	})
	.then(() => {
		if (bestWeights) {
			model.setWeights(bestWeights)
		}

		const result = model.evaluate(XTestTensor, yTestTensor)
		const loss = result[0].dataSync()[0]
		const accuracy = result[1].dataSync()[0]

		const saveLocation = path.resolve(model_location)
		model.save(`file://${saveLocation}`)

		parentPort?.postMessage({ loss, accuracy })
	})
