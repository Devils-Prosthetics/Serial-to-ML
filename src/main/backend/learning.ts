import * as tf from '@tensorflow/tfjs-node'
import * as fs from 'fs'
import config from '../../config.json'

const labelsNames: string[] = []

export const train = (): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    try {
      // Define the model architecture
      const model = tf.sequential()
      model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [96] }))
      model.add(tf.layers.dense({ units: 128, activation: 'relu' }))
      model.add(tf.layers.dense({ units: 4, activation: 'softmax' }))

      model.compile({
        optimizer: 'adam',
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
      })

      // Load the CSV file into memory
      const data = fs
        .readFileSync(config.file_location, 'utf-8')
        .split('\n')
        .map((row) => row.split(','))

      // Split the data into features and labels
      const labels = data.map((row) => returnLabelNumbers(row[row.length - 1]))
      let features = data.map((row) => row.slice(0, -1).map(parseFloat))

      features = normalize(features)

      const [XTrain, XTest, yTrain, yTest] = trainTestSplit(features, labels)

      // Convert the features and labels into tensors
      const XTrainTensor = tf.tensor(XTrain)
      const yTrainTensor = tf.tensor(yTrain)

      const XTestTensor = tf.tensor(XTest)
      const yTestTensor = tf.tensor(yTest)

      // Train the model
      model
        .fit(XTrainTensor, yTrainTensor, { epochs: 50, validationData: [XTestTensor, yTestTensor] })
        .then(() => {
          const result = model.evaluate(XTestTensor, yTestTensor)
          const loss = result[0].dataSync()[0]
          const accuracy = result[0].dataSync()[0]

          resolve([loss, accuracy])
        })
        .catch((error) => {
          reject(error)
        })
    } catch (error) {
      reject(error)
    }
  })
}

const trainTestSplit = (X, y, testSize = 0.2): number[][] => {
  // Combine X and y into a single array
  const data = X.map((x, i) => [x, y[i]])

  // Shuffle the data using Fisher-Yates shuffle algorithm
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
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

const normalize = (arr: number[][]): number[][] => {
  const max: number[] = []
  const min: number[] = []

  arr.forEach((row) => {
    max.push(Math.max(...row))
    min.push(Math.min(...row))
  })

  arr.forEach((row, i) => {
    row.forEach((val, j) => {
      arr[i][j] = (val - min[j]) / (max[j] - min[j])
    })
  })

  return arr
}

const returnLabelNumbers = (label: string): number => {
  label = label.replace(/(\r\n|\n|\r)/gm, '')
  if (!labelsNames.includes(label)) labelsNames.push(label)
  return labelsNames.indexOf(label)
}
