import { Component, h, JSX, Method, Prop, Watch } from '@stencil/core';

@Component({
    tag: 'mi-scroll-buttons',
    styleUrl: 'scroll-buttons.scss',
    shadow: true
})

export class ScrollButtons {
    /**
     * Reference to the element with scroll on parent element.
     *
     * @type {HTMLDivElement}
     */
    @Prop() scrollContainerElementRef: HTMLDivElement;

    /**
     * Update scroll buttons enabled/disabled states.
     */
    @Method()
    public async updateScrollButtons(): Promise<any> {
        this.updateScrollButtonsState();
    }

    /**
     * Watch for container scroll events.
     */
    @Watch('scrollContainerElementRef')
    addScrollEventListener(): void {
        this.resizeObserver?.disconnect();

        this.scrollContainerElementRef?.addEventListener('scroll', () => {
            this.updateScrollButtonsState();
        });

        if (this.scrollContainerElementRef) {
            // Setup a ResizeObserver to update scroll buttons state whenever the dimensions of the scroll container changes.
            this.resizeObserver = new ResizeObserver(() => {
                this.updateScrollButtonsState();
            });

            this.resizeObserver.observe(this.scrollContainerElementRef);
        }
    }

    /**
     * Adds scroll event listener to the container element when this component is first attached to the DOM.
     */
    connectedCallback(): void {
        this.addScrollEventListener();
    }

    /**
     * Disconnects ResizeObserver.
     */
    disconnectedCallback(): void {
        this.resizeObserver?.disconnect();
    }

    /**
     * Determines how far to scroll when clicking one of the buttons. Default value is 100.
     *
     * @type {number}
     */
    @Prop() scrollLength = 100;

    upButtonElement: HTMLButtonElement;
    downButtonElement: HTMLButtonElement;

    resizeObserver: ResizeObserver;

    /**
     * Updates enable/disable state for scroll up and down buttons.
     *
     * @returns {Promise<void>}
     */
    @Method()
    async updateScrollButtonsState(): Promise<void> {
        // Disable or enable the scroll up button
        if (this.scrollContainerElementRef.scrollTop === 0) {
            this.upButtonElement.disabled = true;
        } else if (this.upButtonElement.disabled) {
            this.upButtonElement.disabled = false;
        }

        // Disable or enable the scroll down button
        if (this.scrollContainerElementRef.scrollHeight - this.scrollContainerElementRef.scrollTop === this.scrollContainerElementRef.clientHeight
            && this.upButtonElement.disabled === true
        ) {
            this.downButtonElement.disabled = true;
        } else if (this.scrollContainerElementRef.scrollHeight - this.scrollContainerElementRef.scrollTop > this.scrollContainerElementRef.clientHeight) {
            this.downButtonElement.disabled = false;
        } else {
            this.downButtonElement.disabled = true;
        }
    }

    /**
     * Update scroll position.
     *
     * @param {number} value - Value to scroll.
     */
    updateScrollPosition(value: number): void {
        if (!('scrollBehavior' in document.documentElement.style)) { // Internet Explorer feature check
            this.scrollContainerElementRef.scrollTop = value;
        } else {
            this.scrollContainerElementRef.scroll({
                top: this.scrollContainerElementRef.scrollTop + value,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Render scroll buttons.
     *
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return (
            <div part="container" class="scroll-buttons">
                <button part="button button-up" class="mi-button mi-button--base btn btn-up"
                    type="button"
                    disabled
                    aria-label="Scroll Up"
                    ref={(el: HTMLButtonElement | null): void => {
                        this.upButtonElement = el as HTMLButtonElement | null;
                    }}
                    onClick={(event): void => {
                        event.stopPropagation();
                        this.updateScrollPosition(-this.scrollLength);
                    }}>
                    <mi-icon icon-name="chevron-up" />
                </button>
                <button part="button button-down" class="mi-button mi-button--base btn btn-down"
                    type="button"
                    aria-label="Scroll Down"
                    ref={(el: HTMLButtonElement | null): void => {
                        this.downButtonElement = el as HTMLButtonElement | null;
                    }}
                    onClick={(event): void => {
                        event.stopPropagation();
                        this.updateScrollPosition(this.scrollLength);
                    }}>
                    <mi-icon icon-name="chevron-down" />
                </button>
            </div>
        );
    }
}
