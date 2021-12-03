# Serverless analyze bundle plugin

A Serverless plugin to analyze the bundle of a lambda function.

## Prerequisites 📓

1. Use [serverless-esbuild](https://github.com/floydspace/serverless-esbuild) to bundle your functions
2. Only [individually bundled functions](https://www.serverless.com/framework/docs/providers/aws/guide/packaging#packaging-functions-separately) can be analyzed

## Usage 📦

Install with

```bash
yarn add --dev serverless-analyze-bundle-plugin esbuild-visualizer
```

Add `serverless-analyze-bundle-plugin` to your serverless plugins.

Run the following command to analyze a function:

```bash
serverless package --analyze myFunctionName
```
