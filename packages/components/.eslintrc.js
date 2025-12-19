module.exports = {
    extends: 'eslint:recommended',
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
        es6: true,
        jest: true
    },
    globals: {
        google: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
        sourceType: 'module',  // Allows for the use of imports
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: [
        'jsdoc',
        '@typescript-eslint',
        'react'
    ],
    rules: {
        'no-console': 1, // disallow the use of console
        'no-alert': 1, // disallow the use of alert, confirm, and prompt
        'no-var': 2, // require let or const instead of var
        'prefer-const': 1, // require const declarations for variables that are never reassigned after declared
        'space-in-parens': [1, 'never'], // enforce consistent spacing inside parentheses
        'quotes': [1, 'single'],
        'no-trailing-spaces': 1, // disallow trailing whitespace at the end of lines
        'no-irregular-whitespace': 2, // disallow irregular whitespace
        'eqeqeq': 2, // require the use of === and !==
        'require-await': 0, // Stencil requires publicly exposed methods to be async, but has no requirement to implement any asynchronous code
        'semi': ['error', 'always'], // require or disallow semicolons instead of ASI
        'semi-spacing': 2, // enforce consistent spacing before and after semicolons
        'key-spacing': 1, // enforce consistent spacing between keys and values in object literal properties
        'space-before-blocks': 1, // enforce consistent spacing before blocks
        'keyword-spacing': 1,
        'no-unused-vars': 0,
        'no-undef': 0,
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],

        'jsdoc/check-alignment': 1,
        'jsdoc/check-indentation': 1,
        'jsdoc/check-param-names': 1,
        'jsdoc/check-property-names': 1,
        'jsdoc/check-tag-names': 1,
        'jsdoc/check-types': 1,
        'jsdoc/empty-tags': 1,
        'jsdoc/implements-on-classes': 1,
        'jsdoc/multiline-blocks': 1,
        'jsdoc/newline-after-description': 1,
        'jsdoc/no-multi-asterisks': 1,
        'jsdoc/no-undefined-types': 1,
        'jsdoc/require-asterisk-prefix': 1,
        'jsdoc/require-description': 1,
        'jsdoc/require-description-complete-sentence': 1,
        'jsdoc/require-hyphen-before-param-description': 1,
        'jsdoc/require-jsdoc': [1, {
            'require': { 'MethodDefinition': true },
            'checkConstructors': false,
            'enableFixer': false
        }],
        'jsdoc/require-param-name': 1,
        'jsdoc/require-param-type': 1,
        'jsdoc/require-returns': 1,
        'jsdoc/require-returns-check': 1,
        'jsdoc/require-returns-type': 1,
        'jsdoc/tag-lines': 1,
        'jsdoc/valid-types': 1,

        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off', // Public or private
        '@typescript-eslint/explicit-function-return-type': 'warn', // : Void as return type on functions without
        '@typescript-eslint/type-annotation-spacing': 'warn', // Consistent spacing around type annotations
        '@typescript-eslint/no-unused-vars': ['error', {
            'varsIgnorePattern': '^h$' // Ignore the 'h' variable used in JSX, this is done to prevent errors from eslint due the 'h' variable not being used in the code.
        }],
        'react/jsx-curly-spacing': ['error', 'never'], // Disallow spaces inside of curly braces in JSX attributes
        'react/jsx-equals-spacing': ['error', 'never'] // Disallow spaces around equal signs in JSX attributes
    }
};
