module.exports = {
  extends: ['airbnb-base'],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-param-reassign': ['error', { props: false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
  env: {
    browser: true,
    jasmine: true,
  },
};
