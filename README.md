# Serverless analyze bundle plugin

A Serverless plugin to analyze the bundle of a lambda function.

## Prerequisites 📓

1. Use [serverless-esbuild](https://github.com/floydspace/serverless-esbuild) to bundle your functions
2. Only [individually bundled functions](https://www.serverless.com/framework/docs/providers/aws/guide/packaging#packaging-functions-separately) can be analyzed

## Usage 📦

Install with

```bash
pnpm add -D serverless-analyze-bundle-plugin
```

Add `serverless-analyze-bundle-plugin` to your serverless plugins.

Run the following command to analyze a function:

```bash
serverless package --analyze myFunctionName
```

## Options 🛠

### `--analyze`

The name of the function to analyze.

### `--template`

The bundle template to use. Should be one of `sunburst`, `treemap`, `network`. Defaults to `treemap`.

## Using the CDK instead of the Serverless Framework? 🤔

No worries! Check out my library [cdk-bundle-analyzer](https://github.com/adriencaccia/cdk-bundle-analyzer) that does the same thing for the CDK 🚀
