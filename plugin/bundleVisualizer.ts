import { exec } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join, parse } from 'path';
import { FunctionDefinitionHandler } from 'serverless';

import type { ServerlessAnalyzeBundlePlugin } from './serverlessAnalyzeBundle';

const pExec = (command: string) =>
  new Promise((resolve, reject) => {
    // eslint-disable-next-line max-params
    exec(command, (error, stdout, stderr) => {
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }

      if (error) {
        reject(error);
      }

      resolve(stdout);
    });
  });

const getAllFiles = function (dirPath: string, arrayOfFilesInput: string[] = []) {
  const files = readdirSync(dirPath);

  let arrayOfFiles = arrayOfFilesInput;

  files.forEach(function (file) {
    if (statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
};

const TMP_FOLDER = '/tmp/serverless-esbuild-bundle-analyzer';

async function bundleVisualizer(this: ServerlessAnalyzeBundlePlugin): Promise<void> {
  const { analyze: functionName } = this.options;
  if (functionName === undefined) {
    return;
  }
  const slsFunction = this.serverless.service.getFunction(functionName);

  const fullZipPath = slsFunction.package?.artifact;
  if (fullZipPath === undefined) {
    this.serverless.cli.log(
      `🤯 Analyze failed: function ${functionName} was not found`,
      'ServerlessAnalyzeBundlePlugin',
      { color: 'red' },
    );

    return;
  }
  const functionZipName = parse(fullZipPath).base;

  this.serverless.cli.log(`⏳ Analyzing function ${functionName}`, 'ServerlessAnalyzeBundlePlugin');

  const TEMP_DIR_LOCATION = `${TMP_FOLDER}/${functionZipName}/${new Date().getTime()}`;
  await pExec(`mkdir -p ${TEMP_DIR_LOCATION}`);

  await pExec(`unzip .serverless/${functionZipName} -d ${TEMP_DIR_LOCATION}`);

  const allFiles = getAllFiles(`${TEMP_DIR_LOCATION}`);
  const handlerPath = (slsFunction as FunctionDefinitionHandler).handler.split('.')[0];
  const metafileName = allFiles.filter(
    fileName => fileName.includes(handlerPath) && fileName.endsWith('-meta.json'),
  )[0];

  if (!metafileName) {
    this.serverless.cli.log(
      `🤯 Analyze failed: function ${functionName} metadata was not found`,
      'ServerlessAnalyzeBundlePlugin',
      { color: 'red' },
    );

    return;
  }

  await pExec(
    [
      'node_modules/.bin/esbuild-visualizer',
      '--metadata',
      metafileName,
      '--filename',
      `${TEMP_DIR_LOCATION}/${functionName}.html`,
      '--open',
    ].join(' '),
  );
}

export default bundleVisualizer;
