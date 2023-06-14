/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, Element, Host, JSX, Prop, State, h } from '@stencil/core';

@Component({
    tag: 'mi-floor-selector',
    styleUrl: 'floor-selector.scss',
    shadow: false
})
export class FloorSelector {
    /**
     * MapsIndoors instance.
     */
    @Prop() mapsindoors;

    /**
     * The color to use as the primary color (as background color of the selected floor in the list).
     *
     * @type {string}
     */
    @Prop() primaryColor?: string;

    @State() floors = new Array();
    @State() currentFloor: string;
    @State() floorSelectorClosed: boolean = true;

    @Element() el: HTMLDivElement;

    private currentFloorElement: HTMLElement;
    private maxListHeight: number = 300; // The floor-selector.scss: $max-list-height variable needs to be synced with this value

    /**
     * Scrolling the floorList element to the selected floor.
     */
    private scrollToSelectedFloor(): void {
        const floorSelectorElement = this.el.shadowRoot.querySelector('.mi-floor-selector') as HTMLElement;
        const floorListElement = this.el.shadowRoot.querySelector('.mi-floor-selector__list') as HTMLElement;

        if (this.currentFloorElement && floorSelectorElement.clientHeight / 2 < this.currentFloorElement.offsetTop) {
            floorListElement.scrollTop = this.currentFloorElement.offsetTop - floorSelectorElement.clientHeight;
        }
    }

    /**
     * Applies a 'transform: translateY()' animation to the provided element.
     *
     * @param {HTMLElement} element
     * @param {number} distance
     * @param {number} duration
     */
    private animateTranslateY(element: HTMLElement, distance: number, duration: number): void {
        const keyframes = [{ transform: `translateY(${distance}px)` }];
        element.animate(keyframes, { duration, fill: 'forwards' });
    }

    /**
     * Calls the animation for the needed elements with the calculated animation values.
     */
    private animateFloorSelector(): void {
        const floorListElement = this.el.shadowRoot.querySelector('.mi-floor-selector__list') as HTMLElement;
        const floorElements = this.el.shadowRoot.querySelectorAll('.mi-floor-selector__floor');

        // Elements that are placed before the selected element in the markup.
        const elementsBeforeSelected = [];
        for (let i = 0; i < floorElements.length; i++) {
            // Stop iterating when we reach the clicked element
            if (floorElements[i].getAttribute('data-floor') === this.currentFloor) {
                break;
            }
            elementsBeforeSelected.push(floorElements[i]);
        }

        if (this.floorSelectorClosed) {
            const listScrollTop = floorListElement.scrollTop;
            const listPaddingTop: number = parseInt(window.getComputedStyle(floorListElement).getPropertyValue('padding-top'));
            const seletedElementDistanceFromTop = this.currentFloorElement.offsetTop - floorListElement.offsetTop;
            const distance: number = -(seletedElementDistanceFromTop - listScrollTop - listPaddingTop);
            this.animateTranslateY(this.currentFloorElement, distance, 250);

            // If the floor selector has been scrolled, all floors need to be pushed down.
            if (floorListElement.scrollTop > 0) {
                floorElements.forEach(floorElement => {
                    if (floorElement.getAttribute('data-floor') !== this.currentFloor) {
                        // Floors placed before the first floor need to be pushed further down.
                        if (elementsBeforeSelected.indexOf(floorElement) > -1) {
                            this.animateTranslateY(floorElement as HTMLElement, (floorElement as HTMLElement).offsetTop + floorListElement.scrollTop, 250);
                        } else {
                            this.animateTranslateY(floorElement as HTMLElement, floorListElement.scrollTop, 250);
                        }
                    }
                });
            } else {
                // If the floor selector has NOT been scrolled, only the elements above the selected floor need to be pushed down.
                // The selected floor will take the position of the first floor in the list.
                elementsBeforeSelected.forEach(floorElement => {
                    this.animateTranslateY(floorElement, floorElement.offsetTop, 250);
                });
            }
        } else {
            // If the floor selector is closed, all elements need to be animated back to their original position.
            this.animateTranslateY(this.currentFloorElement, 0, 250);
            floorElements.forEach(floorElement => {
                if (floorElement.getAttribute('data-floor') !== this.currentFloor) {
                    this.animateTranslateY(floorElement as HTMLElement, 0, 250);
                }
            });
        }
    }

    /**
     * Toggles the floor selector open-close.
     */
    private onToggleFloorSelector(): void {
        this.floorSelectorClosed = !this.floorSelectorClosed;
        this.animateFloorSelector();

        if (!this.floorSelectorClosed) {
            this.scrollToSelectedFloor();
        }

        this.onScrollStyle();
    }

    /**
     * Adding/removing classes to the floorlist to fade-in/out the top/bottom part of the container..
     */
    private onScrollStyle(): void {
        const floorListElement = this.el.shadowRoot.querySelector('.mi-floor-selector__list') as HTMLElement;
        const maxScrollTop = floorListElement.scrollHeight - floorListElement.clientHeight;

        if (this.floorSelectorClosed) {
            floorListElement.classList.remove('mi-floor-selector__list--fade-top');
            floorListElement.classList.remove('mi-floor-selector__list--fade-bottom');
            return;
        }

        if (this.maxListHeight > floorListElement.clientHeight - 48) {
            return;
        }

        if (floorListElement.scrollTop > 0) {
            floorListElement.classList.add('mi-floor-selector__list--fade-top');
        } else {
            floorListElement.classList.remove('mi-floor-selector__list--fade-top');
        }

        if (floorListElement.scrollTop === maxScrollTop) {
            floorListElement.classList.remove('mi-floor-selector__list--fade-bottom');
        } else {
            floorListElement.classList.add('mi-floor-selector__list--fade-bottom');
        }
    }

    /**
     * Sets the clicked floor active.
     *
     * @param {PointerEvent} event
     */
    private onSelectFloor(event: PointerEvent): void {
        this.mapsindoors.setFloor((event.currentTarget as HTMLElement).getAttribute('data-floor'));
        this.currentFloor = this.mapsindoors.getFloor().toString();
        this.currentFloorElement = event.currentTarget as HTMLElement;
    }

    /**
     * Called every time the component is connected to the DOM.
     * It resets the floorlist and the active floor when the building changes.
     */
    connectedCallback(): void {
        this.mapsindoors.addListener('building_changed', () => {
            this.floors = [];
            const building = this.mapsindoors.getBuilding();
            if (building) {
                if (!this.mapsindoors.getFloor()) {
                    return;
                }
                this.currentFloor = this.mapsindoors.getFloor().toString();

                Object.keys(building.floors)
                    .sort((a, b): any => (b as any) - (a as any))
                    .forEach(floor => {
                        building.floors[floor].index = floor;
                        this.floors.push(building.floors[floor]);
                    });
            }
        });
    }

    /**
     * Renders the floor selector.
     *
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return (
            <Host>
                <div class='mi-floor-selector'>
                    <button
                        class={`mi-floor-selector__button mi-floor-selector__button--${this.floorSelectorClosed ? 'closed' : 'open'}`}
                        onClick={(): void => this.onToggleFloorSelector()}>
                    </button>

                    <div class='mi-floor-selector__list' onScroll={(): void => this.onScrollStyle()}>
                        {this.floors.map((floor) => (
                            <button
                                data-floor={floor.index}
                                style={this.currentFloor === floor.index ? { backgroundColor: this.primaryColor } : {}}
                                class={`mi-floor-selector__floor ${this.currentFloor === floor.index ? 'mi-floor-selector__floor--active' : ''}`}
                                onClick={(event: PointerEvent): void => this.onSelectFloor(event)}>
                                <span>{floor.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Host>
        );
    }

    /**
     * Called after every render().
     */
    componentDidRender(): void {
        const floorSelectorElement = this.el.shadowRoot.querySelector('.mi-floor-selector') as HTMLElement;
        if (!this.mapsindoors.getBuilding()) {
            floorSelectorElement.classList.add('mi-floor-selector--hidden');
        } else {
            floorSelectorElement.classList.remove('mi-floor-selector--hidden');
        }

        this.currentFloorElement = this.el.shadowRoot.querySelector('.mi-floor-selector__floor--active');
        this.currentFloor = this.currentFloorElement?.getAttribute('data-floor');

        if (this.currentFloorElement && this.currentFloor) {
            this.animateFloorSelector();
        }
    }
}