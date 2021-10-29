# Serverless analyze bundle plugin

A Serverless plugin to analyze the bundle of a lambda function.

## Usage

Install with

```bash
yarn add --dev serverless-analyze-bundle-plugin esbuild-visualizer
```

Add `serverless-analyze-bundle-plugin` to your serverless plugins.

Run the following command to analyze a function:

```bash
serverless package --analyze myFunctionName
```
