module.exports = {
  extends: 'airbnb-base',
  globals: {},
  rules: {
    indent: 2,
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'linebreak-style': ['error', 'unix'],
    quotes: [2, 'single'],
    camelcase: 'off',
  },
  env: {
    mocha: true,
  },
};
