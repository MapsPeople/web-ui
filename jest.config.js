module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  roots: ['<rootDir>/packages/map-template'], // Added map-template package for testing, more packages can be added here
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/jest.fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};