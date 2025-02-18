module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  roots: ['<rootDir>/packages/map-template'],
  moduleNameMapper: {
    // Handle CSS/SCSS modules
    '\\.(scss|sass|css)$': 'identity-obj-proxy',
    // Handle static assets
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/jest.fileMock.js',
    // Handle SCSS imports with variables
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};