module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest'
    },
    moduleNameMapper: {
        '\\.(css|scss|sass)$': 'identity-obj-proxy',
        '\\.svg\\?react$': '<rootDir>/jest.svgComponentMock.cjs',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/jest.fileMock.cjs'
    },
    testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/']
};
