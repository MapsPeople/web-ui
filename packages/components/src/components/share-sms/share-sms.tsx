import { Component, ComponentInterface, Event, EventEmitter, h, JSX, Prop } from '@stencil/core';

declare const mapsindoors;

@Component({
    tag: 'mi-share-sms',
    styleUrl: 'share-sms.scss',
    // shadow: true // TODO: set as true when keyboard refactoring is done
})
export class ShareSms implements ComponentInterface {
    /**
     * MapsIndoors venue id.
     *
     * @type {string}
     */
    @Prop({ attribute: 'venue' }) venueId: string;

    /**
     * MapsIndoors id for origin location.
     *
     * @type {string}
     */
    @Prop({ attribute: 'origin' }) originLocationId: string;

    /**
     * MapsIndoors id for destination location.
     *
     * @type {string}
     */
    @Prop({ attribute: 'destination' }) destinationLocationId: string;

    /**
     * Default value for country code input field.
     *
     * @type {string}
     */
    @Prop() countryCode: string = '1';

    /**
     * Placeholder text for phone number input field.
     *
     * @type {string}
     */
    @Prop({ attribute: 'input-placeholder' }) phoneNumberInputPlaceholder: string = 'Enter phone number';

    /**
     * Label for submit button.
     *
     * @type {string}
     */
    @Prop() submitButtonLabel: string = 'Send SMS';

    /**
     * Emits a success event when the SMS is send.
     *
     * @type {EventEmitter}
     */
    @Event() successfullySent: EventEmitter;

    /**
     * Emits a error message when the SMS wasn't send.
     *
     * @type {EventEmitter<string>}
     */
    @Event() unsuccessfullySent: EventEmitter<string>;

    intersectionObserver: IntersectionObserver;
    formElement: HTMLFormElement;
    countryCodeInputElement: HTMLInputElement;
    phoneNumberInputElement: HTMLInputElement;
    submitButtonElement: HTMLButtonElement;
    miKeyboardElement: HTMLMiKeyboardElement;

    componentDidRender(): void {
        this.countryCodeInputElement.value = this.countryCode;
    }

    componentDidLoad(): void {
        this.addIntersectionObserver();
    }

    /**
     * Observe the input field for phone number and focus it on intersection.
     */
    addIntersectionObserver(): void {
        this.intersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
            if (entries[0].intersectionRatio <= 0) {
                return;
            }
            this.phoneNumberInputElement.focus();

            this.intersectionObserver.disconnect();
        });
        this.intersectionObserver.observe(this.phoneNumberInputElement);
    }

    /**
     * Set input attribute on mi-keyboard component.
     *
     * @param {FocusEvent} event
     */
    setKeyboardInputElement(event: FocusEvent): void {
        this.miKeyboardElement.inputElement = event.target as HTMLInputElement;
    }

    /**
     * Handle form submission event and send directions to phone if validation checks passes.
     */
    submitFormHandler = (event: Event): void => {
        event.preventDefault();

        const isParametersValid = this.venueId && this.originLocationId && this.destinationLocationId ? true : false;
        if (!this.formElement.checkValidity() || !isParametersValid) {

            if (!this.countryCodeInputElement.validity.valid) {
                this.countryCodeInputElement.focus();
            }

            if (!this.phoneNumberInputElement.validity.valid) {
                this.phoneNumberInputElement.focus();
            }

            return;
        }

        mapsindoors.services.ShareService.directionsToPhone(
            this.venueId,
            this.originLocationId,
            this.destinationLocationId,
            this.countryCodeInputElement.value,
            this.phoneNumberInputElement.value
        )
            .then(() => this.successfullySent.emit())
            .catch((err: string) => this.unsuccessfullySent.emit(err));
    }

    /**
     * Update form validity.
     */
    updateFormValidity(): void {
        // Form validity check
        if (!this.formElement.checkValidity()) {
            this.submitButtonElement.disabled = true;
            return;
        }

        this.submitButtonElement.disabled = false;
    }

    render(): JSX.Element {
        return (
            <form onSubmit={this.submitFormHandler} ref={(el) => this.formElement = el as HTMLFormElement}>
                <div class="inputs">
                    <span class="plus-sign">＋</span>
                    <input
                        id="country-code"
                        class="country-code"
                        pattern="[0-9]{1,3}"
                        required
                        autocomplete="off"
                        type="text"
                        placeholder={this.countryCode}
                        ref={(el) => this.countryCodeInputElement = el as HTMLInputElement}
                        onInput={() => this.updateFormValidity()}
                        onFocus={(e) => this.setKeyboardInputElement(e)}
                    />
                    <input
                        id="phone-number"
                        class="phone-number"
                        pattern="[0-9]{6,10}"
                        required
                        autocomplete="off"
                        type="text"
                        placeholder={this.phoneNumberInputPlaceholder}
                        ref={(el) => this.phoneNumberInputElement = el as HTMLInputElement}
                        onInput={() => this.updateFormValidity()}
                        onFocus={(e) => this.setKeyboardInputElement(e)}
                    />
                </div>

                <mi-keyboard
                    layout="numeric"
                    ref={(el) => this.miKeyboardElement = el as HTMLMiKeyboardElement}>
                </mi-keyboard>

                <div class="flex justify-center">
                    <button
                        type="submit"
                        disabled
                        class="mi-button mi-button--primary"
                        ref={(el) => this.submitButtonElement = el as HTMLButtonElement}
                    >{this.submitButtonLabel}</button>
                </div>
            </form>
        );
    }
}
