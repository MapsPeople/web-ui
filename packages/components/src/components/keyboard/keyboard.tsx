import { Component, ComponentInterface, h } from '@stencil/core';
import { JSX, Prop, Watch, Method } from '@stencil/core/internal';
import SimpleKeyboard from 'simple-keyboard';
import { chineseAlphabetic, danishAlphabetic, defaultAlphabetic, dutchAlphabetic, frenchAlphabetic, germanAlphabetic, italianAlphabetic, spanishAlphabetic, unitedStatesAlphabetic } from './keyboard-alphabetic-layouts';
import { KeyboardLayout } from './keyboard-layout.enum';
import { defaultNumeric } from './keyboard-numeric-layouts';

@Component({
    tag: 'mi-keyboard',
    styleUrl: 'keyboard.scss',
})
export class Keyboard implements ComponentInterface {

    /**
     * The active input element.
     *
     * @type {HTMLInputElement}
     */
    @Prop() inputElement: HTMLInputElement;
    @Watch('inputElement')
    inputElementChange(): void {
        // Check for id attribute (Used by SimpleKeyboard to differ between multiple inputs for the same Mi-keyboard instance)
        if (!this.inputElement.hasAttribute('id')) {
            // eslint-disable-next-line no-console
            console.warn('MI-KEYBOARD: Invalid id attribute');
            return;
        }

        if (this.simpleKeyboard) {
            // Update SimpleKeyboards input element reference
            this.simpleKeyboard.setOptions({ inputName: this.inputElement.id });
            // Update SimpleKeyboards input value
            this.simpleKeyboard.setInput(this.inputElement.value, this.inputElement.id);
        }

        // Check to make sure that event listeners only is added to new input elements
        if (!this.inputElements.has(this.inputElement)) {
            this.inputElements.add(this.inputElement);
            // Update SimpleKeyboards input value on the following events.
            // The custom event 'inputCleared' is for manually triggering.
            const eventsToListenFor = ['input', 'focus', 'blur', 'inputCleared'];
            eventsToListenFor.forEach((event: string) => {
                this.inputElement.addEventListener(event, () => {
                    this.simpleKeyboard.setInput(this.inputElement.value, this.inputElement.id);
                });
            });
        }
    }

    /**
     * The keyboard layout to use. Defaults to alphabetic.
     *
     * @type {KeyboardLayout}
     */
    @Prop() layout: string = KeyboardLayout.Alphabetic;
    @Watch('layout')
    layoutChange(): void {
        if (this.simpleKeyboard) {
            this.simpleKeyboard.setOptions({ layout: this.getKeyboardLayout(this.layout as KeyboardLayout) });
        }
    }

    /**
     * The keyboard language to use. Supported values are "en" (English), "fr" (French), "de", (German) and "da" (Danish).
     * If omitted, the browser language will be used. Defaults to English.
     */
    @Prop() language: string;
    @Watch('language')
    languageChange(): void {
        this.simpleKeyboard.setOptions({
            layout: this.getKeyboardLayout(this.layout as KeyboardLayout)
        });
    }

    private simpleKeyboard: SimpleKeyboard;
    private inputElements = new Set<HTMLInputElement>();

    componentDidLoad(): void {
        this.simpleKeyboard = new SimpleKeyboard({
            onChange: (input: string) => {
                if (this.inputElement) {
                    this.inputElement.value = input;
                    this.inputElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                }
            },
            layout: this.getKeyboardLayout(this.layout as KeyboardLayout),
            display: {
                '{bksp}': '&#9003;',
                '{enter}': 'return',
                '{space}': 'space'
            },
            theme: 'hg-theme-default hg-layout-numeric numeric-theme'
        });

        // Populate the keyboard's internal input value with any existing value from the input field.
        this.simpleKeyboard.setInput(this.inputElement.value);
    }

    /**
     * Clear the input field.
     */
    @Method()
    clearInputField(): void {
        this.simpleKeyboard.clearInput();
    }

    /**
     * Check validity of keyboard layout.
     *
     * @param {layout} string
     * @returns {boolean}
     */
    isValidLayout(layout: string): boolean {
        if (!layout) return false;
        return Object.values(KeyboardLayout).find((keyboardLayout: string): boolean => keyboardLayout === layout) ? true : false;
    }

    /**
     * Get keyboard layout. Defaults to alphabetic.
     *
     * @param {KeyboardLayout} keyboardLayout - Accepts values of KeyboardLayout enum, eg. 'numeric' or 'alphabetic'.
     * @returns {{ [key: string]: string[]; }}
     */
    getKeyboardLayout(keyboardLayout: KeyboardLayout): { [key: string]: string[]; } {
        if (!this.isValidLayout(keyboardLayout)) {
            // eslint-disable-next-line no-console
            console.warn('MI-KEYBOARD: Invalid layout attribute');
            return defaultAlphabetic;
        }

        // Numeric layout
        if (keyboardLayout === KeyboardLayout.Numeric) {
            return defaultNumeric;
        }

        // Alphabetic layout
        const browserLanguage: string = this.language || window.navigator.language;
        if (!browserLanguage) return defaultAlphabetic; // Return defaultAlphabetic if navigator language isn't available.
        const supportedAlphabeticLayouts: Array<{ layout: { default: string[] }, languages: string[] }> = [ // Mapping multiple languages to a single keyboard layout
            { layout: unitedStatesAlphabetic, languages: ['en', 'en-us'] },
            { layout: danishAlphabetic, languages: ['da', 'da-dk'] },
            { layout: frenchAlphabetic, languages: ['fr', 'fr-fr'] },
            { layout: germanAlphabetic, languages: ['de', 'de-de'] },
            { layout: italianAlphabetic, languages: ['it', 'it-it'] },
            { layout: spanishAlphabetic, languages: ['es', 'es-es'] },
            { layout: dutchAlphabetic, languages: ['nl', 'nl-nl'] },
            { layout: chineseAlphabetic, languages: ['zh', 'zh-CN'] },
        ];
        const supportedLayout = supportedAlphabeticLayouts.find((layout): boolean => {
            return layout.languages.find((language): boolean => language === browserLanguage.toLowerCase()) ? true : false;
        });
        return supportedLayout ? supportedLayout.layout : defaultAlphabetic;
    }

    /**
     * Render on-screen keyboard.
     *
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return (
            <div class='simple-keyboard'></div>
        );
    }
}
