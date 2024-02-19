# Serial-to-ML

An Electron application with Vue and TypesSript

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Architecture
The project is divided into two main parts: the frontend and the backend.
<img width="1584" alt="Result" src="https://github.com/Devils-Prosthetics/Serial-to-ML/assets/75190918/f1fc7cf6-2cb9-4b99-b914-a82d44f368f8">


### Frontend
The frontend is built using Vue and TypeScript. It is responsible for the user interface and the communication with the backend.

### Backend
The backend is built using Electron. It is responsible for the communication with the serial port and the machine learning model.

### Communication
The frontend and the backend communicate using sockets. The frontend sends commands to the backend and the backend sends data to the frontend. The frontend and the backend are hosted on ports defined in `./src/config.json`, as seperate processes.

#### Backend Commands
Here is a list of the commands that the frontend can send to the backend using sockets as seen in `./src/main/backend/server.ts`:
 - `ping`: The backend will respond with a pong.
 - `setupSerial`: The backend will setup the serial port.
 - `stopSerial`: The backend will stop the serial port.
 - `startSave`: The backend will start saving the data from the serial port.
 - `endSave`: The backend will stop saving the data from the serial port.
 - `clearSave`: The backend will clear the saved data.
 - `updateTag`: The backend will update the tag used for the saved data.
 - `test`: The backend will test the trained model with the data sent alongside the message.
 - `shouldLogSerial`: The backend will start or stop logging the data from the serial port.
 - `train`: The backend will train the model with the saved data.

#### Frontend Commands
Here is a list of the commands that the backend can send to the frontend using sockets as seen in `./src/renderer/src/App.vue` and `./src/renderer/src/components/serial.vue`:
 - `error`: The frontend will display an error message with data sent.
 - `success`: The frontend will display a success message with data sent.
 - `logdata`: The frontend will display the data sent in the built in console.

### Machine Learning Model
The machine learning model is built using TensorFlow.js. The model is trained using the data from the serial port. The model is then used to predict the data from the serial port using the model defined in `./src/main/backend/fit_model.js`. The model is saved to the model location defined in the `./src/config.json` and is used in the backend to predict the data from the serial port.

### Setup for use of Model in C++
The model can be converted to a TensorFlow Lite model for use in C++ using the following commands:

```bash
tensorflowjs_converter --input_format tfjs_layers_model  --output_format keras_saved_model  model/model.json out_model/
tflite_convert --saved_model_dir out_model --output_file ./outfile.tflite
xxd -i outfile.tflite > model.cc
```
