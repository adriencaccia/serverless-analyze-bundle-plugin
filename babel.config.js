const defaultPresets = [['@babel/preset-typescript', { allowNamespaces: true }]];

const defaultIgnores = [
  '**/*.test.tsx?',
  '**/test.tsx?',
  '**/*.stories.tsx?',
  '**/stories.tsx?',
  'node_modules',
  'dist',
];

const presetsForESM = [
  [
    '@babel/preset-env',
    {
      modules: false,
    },
  ],
  ...defaultPresets,
];
const presetsForCJS = [
  [
    '@babel/preset-env',
    {
      modules: 'cjs',
    },
  ],
  ...defaultPresets,
];

module.exports = {
  env: {
    cjs: {
      presets: presetsForCJS,
    },
    esm: {
      presets: presetsForESM,
    },
  },
  ignore: defaultIgnores,
  plugins: ['@babel/plugin-transform-runtime'],
};
