import { Component, h, Prop, Listen } from '@stencil/core';
import { JSX } from '@stencil/core/internal';


@Component({
    tag: 'mi-list',
    styleUrl: 'list.scss',
    shadow: true
})
export class List {
    /**
     * @description Determines if the MI Scroll Buttons Component should be rendered.
     * @type {boolean}
     */
    @Prop() scrollButtonsEnabled = false;

    /**
     * @description Determines how far to scroll when clicking one of the buttons from the MI Scroll Buttons Component.
     * @type {number}
     */
    @Prop() scrollLength = 100;

    private intersectionObserver: IntersectionObserver;
    private scrollContainerElement: HTMLDivElement;
    private miScrollButtonsElement: HTMLMiScrollButtonsElement;

    componentDidLoad(): void {
        this.addIntersectionObserver();

        if (this.scrollButtonsEnabled) {
            this.setScrollContainerElementRef();
        }
    }

    /**
     * @description Update state of scroll buttons when a "listItemDidRender" event is fired.
     * @private
     */
    @Listen('listItemDidRender')
    private updateScrollButtonsState(): void {
        if (this.scrollButtonsEnabled && this.miScrollButtonsElement.scrollContainerElementRef) {
            this.miScrollButtonsElement.updateScrollButtonsState();
        }
    }

    /**
     * @description Set scrollContainerElementRef attribute on miScrollButtonsElement.
     * @private
     */
    private setScrollContainerElementRef(): void {
        this.miScrollButtonsElement.scrollContainerElementRef = this.scrollContainerElement;
    }

    /**
     * @description Add intersection observer and update scroll buttons state on intersection – workaround to avoid the element not having any dimensions before it's shown.
     * @private
     */
    private addIntersectionObserver(): void {
        this.intersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
            if (entries[0].intersectionRatio <= 0) {
                return;
            }
            // Disable scroll buttons if container element doesn't have scroll
            if (this.scrollContainerElement.scrollHeight - this.scrollContainerElement.scrollTop === this.scrollContainerElement.clientHeight) {
                this.updateScrollButtonsState();
            }
            this.intersectionObserver.disconnect();
        });
        this.intersectionObserver.observe(this.scrollContainerElement);
    }

    render(): JSX.Element {
        return (
            <div class="container">
                <div role="list" class="scroll-container" ref={(el) => this.scrollContainerElement = el as HTMLDivElement}>
                    <slot />
                </div>
                {this.scrollButtonsEnabled ? <mi-scroll-buttons scrollLength={this.scrollLength} ref={(el) => this.miScrollButtonsElement = el as HTMLMiScrollButtonsElement}></mi-scroll-buttons> : null}
            </div>
        );
    }
}
