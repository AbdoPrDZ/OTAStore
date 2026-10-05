module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['scripts/**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
