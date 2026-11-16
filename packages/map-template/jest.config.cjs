module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest'
    },
    // Jotai only ships ES modules, so it has to be transformed for Jest.
    transformIgnorePatterns: ['/node_modules/(?!jotai/)'],
    moduleNameMapper: {
        '\\.(css|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/jest.fileMock.cjs'
    },
    testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/']
};
