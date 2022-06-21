import check from 'check-node-version';
import { exec } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { mkdir } from 'fs/promises';
import { join, normalize, parse } from 'path';
import { FunctionDefinitionHandler } from 'serverless';
import StreamZip from 'node-stream-zip';

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
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

const TMP_FOLDER = join(tmpdir(), 'serverless-esbuild-bundle-analyzer');

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

  const TEMP_DIR_LOCATION = join(TMP_FOLDER, functionZipName, new Date().getTime().toString());
  await mkdir(TEMP_DIR_LOCATION, { recursive: true });

  const functionZip = new StreamZip.async({ file: `.serverless/${functionZipName}` });
  await functionZip.extract(null, TEMP_DIR_LOCATION);

  const allFiles = getAllFiles(`${TEMP_DIR_LOCATION}`);
  const handlerPath = normalize((slsFunction as FunctionDefinitionHandler).handler.split('.')[0]);
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

  const commandArray = [
    '--metadata',
    metafileName,
    '--filename',
    `${TEMP_DIR_LOCATION}/${functionName}.html`,
    '--open',
  ];

  check({ yarn: '>=2' }, err => {
    if (err !== null) {
      commandArray.unshift('node_modules/.bin/esbuild-visualizer');
    } else {
      commandArray.unshift('yarn', 'esbuild-visualizer');
    }

    void pExec(commandArray.join(' '));
  });
}

export default bundleVisualizer;
