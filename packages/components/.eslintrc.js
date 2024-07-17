module.exports = {
    'extends': '@mapsindoors/eslint-config-typescript',
    'parser': '@typescript-eslint/parser',
    'env': {
        'browser': true,
        'es6': true,
        'jest': true
    },
    'globals': {
        'google': 'readonly'
    },
    'parserOptions': {
        ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
        sourceType: 'module',  // Allows for the use of imports
    },
    'rules': {
        'require-await': 0, // Stencil requires publicly exposed methods to be async, but has no requirement to implement any asynchronous code
        '@typescript-eslint/no-unused-vars': ['error', {
            'varsIgnorePattern': '^h$' // Ignore the 'h' variable used in JSX, this is done to prevent errors from eslint due the 'h' variable not being used in the code.
        }]
    }
};
