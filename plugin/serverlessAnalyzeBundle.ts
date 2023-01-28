import Serverless from 'serverless';
import Plugin from 'serverless/classes/Plugin';

import bundleVisualizer from './bundleVisualizer';

interface OptionsExtended extends Serverless.Options {
  analyze?: string;
}

export class ServerlessAnalyzeBundlePlugin implements Plugin {
  options: OptionsExtended;
  serverless: Serverless;
  hooks: Plugin.Hooks;
  commands: Plugin.Commands;
  bundleVisualizer: typeof bundleVisualizer;

  // eslint-disable-next-line max-params
  constructor(serverless: Serverless, options: OptionsExtended, logging: Plugin.Logging) {
    this.bundleVisualizer = bundleVisualizer.bind(this);

    this.options = options;
    this.serverless = serverless;
    this.commands = {
      package: {
        usage: 'Analyze the bundle of a lambda function',
        options: {
          analyze: {
            // @ts-expect-error plugin is badly typed 🤔
            type: 'string',
            usage: 'Specify the function you want to analyze (e.g. "--analyze \'helloWorld\'")',
          },
        },
      },
    };
    this.hooks = {
      'after:package:finalize': async () => {
        const { analyze } = this.options;
        if (analyze === undefined) {
          return;
        }
        await this.bundleVisualizer({ logging });
      },
    };

    // The plugin requires metafile option to be true
    // We set it here (and not within a hook) because Serverless Framework keeps copies of service configuration
    // therefore overwriting changes made by hook functions
    const { analyze } = this.options;
    if (analyze === undefined) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.serverless.service.custom.esbuild.metafile = true;
  }
}
