# reader

An Electron application with Vue and TypesSript

## Recommended IDE Setup

-   [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

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

```
tensorflowjs_converter --input_format tfjs_layers_model  --output_format keras_saved_model  model/model.json out_model/
tflite_convert --saved_model_dir out_model --output_file ./outfile.tflite
xxd -i outfile.tflite > model.cc
```
