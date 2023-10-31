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
    @Prop() primaryColor?: string = '#005655';

    @State() floors = new Array();
    @State() currentFloor: string;
    @State() floorSelectorClosed: boolean = true;
    @State() fadeFloorSelectorOnTop: boolean = false;
    @State() fadeFloorSelectorOnBottom: boolean = false;

    @Element() el: HTMLDivElement;

    private floorSelectorElement: HTMLDivElement;
    private floorListElement: HTMLDivElement;
    private currentFloorElement: HTMLElement;
    private maxListHeight: number = 300; // The floor-selector.scss: $max-list-height variable needs to be synced with this value

    /**
     * Scrolling the floorList element to the selected floor.
     */
    private scrollToSelectedFloor(): void {
        // Get the container and list heights
        const containerHeight = this.floorSelectorElement.clientHeight;
        const listHeight = this.floorListElement.scrollHeight;

        // Get the selected list item's position relative to the list
        const currentFloorOffsetTop = this.currentFloorElement.offsetTop;
        const currentFloorHeight = this.currentFloorElement.offsetHeight;

        // Calculate the scrollTop value for the selected list item
        let scrollTopValue: number;
        if (listHeight > containerHeight) {
            // Center the selected list item within the container
            scrollTopValue = currentFloorOffsetTop - (containerHeight / 2) + (currentFloorHeight / 2);
            scrollTopValue = Math.max(0, scrollTopValue); // Prevent negative values
            scrollTopValue = Math.min(scrollTopValue, listHeight - containerHeight); // Limit within valid range
        } else {
            // If the list is smaller than the container, scroll to the top
            scrollTopValue = 0;
        }

        // Set the scrollTop property on the list element
        this.floorListElement.scrollTop = scrollTopValue;

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
        const floorElements = this.el.querySelectorAll('.mi-floor-selector__floor');

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
            const listScrollTop = this.floorListElement.scrollTop;
            const listPaddingTop: number = parseInt(window.getComputedStyle(this.floorListElement).getPropertyValue('padding-top'));
            const selectedElementDistanceFromTop = this.currentFloorElement.offsetTop - this.floorListElement.offsetTop;
            const newElementDistanceFromTop: number = -(selectedElementDistanceFromTop - listScrollTop - listPaddingTop);
            this.animateTranslateY(this.currentFloorElement, newElementDistanceFromTop, 250);

            // If the floor selector has been scrolled, all floors need to be pushed down.
            if (this.floorListElement.scrollTop > 0) {
                floorElements.forEach(floorElement => {
                    if (floorElement.getAttribute('data-floor') !== this.currentFloor) {
                        // Floors placed before the first floor need to be pushed further down.
                        if (elementsBeforeSelected.indexOf(floorElement) > -1) {
                            this.animateTranslateY(floorElement as HTMLElement, (floorElement as HTMLElement).offsetTop + this.floorListElement.scrollTop, 250);
                        } else {
                            this.animateTranslateY(floorElement as HTMLElement, this.floorListElement.scrollTop, 250);
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

        this.floorListElement.addEventListener('transitionend', () => {
            if (!this.floorSelectorClosed) {
                this.scrollToSelectedFloor();
            }

            this.onScrollStyle();
        }, { once: true });
    }

    /**
     * Adding/removing classes to the floorlist to fade-in/out the top/bottom part of the container..
     */
    private onScrollStyle(): void {
        const maxScrollTop = this.floorListElement.scrollHeight - this.floorListElement.clientHeight;

        if (this.floorSelectorClosed) {
            this.fadeFloorSelectorOnTop = false;
            this.fadeFloorSelectorOnBottom = false;
            return;
        }

        if (this.maxListHeight > this.floorListElement.clientHeight - 48) {
            return;
        }

        this.fadeFloorSelectorOnTop = this.floorListElement.scrollTop > 0 ? true : false;
        this.fadeFloorSelectorOnBottom = this.floorListElement.scrollTop === maxScrollTop ? false : true;
    }

    /**
     * Sets the clicked floor active.
     *
     * @param {PointerEvent} event
     */
    private onSelectFloor(event: PointerEvent, floorIndex: string): void {
        this.mapsindoors.setFloor(floorIndex);
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
                const floorChangedListener = (): void => {
                    this.currentFloor = this.mapsindoors.getFloor().toString();
                    this.mapsindoors.removeListener('floor_changed', floorChangedListener);
                };

                if (this.mapsindoors.getFloor() === null || this.mapsindoors.getFloor() === undefined) {
                    this.mapsindoors.addListener('floor_changed', floorChangedListener);
                } else {
                    this.currentFloor = this.mapsindoors.getFloor().toString();
                }

                Object.keys(building.floors)
                    .sort((a, b): any => (b as any) - (a as any))
                    .forEach(floor => {
                        building.floors[floor].index = floor;
                        this.floors.push(building.floors[floor]);
                    });
            }
        });

        this.mapsindoors.addListener('floor_changed', () => {
            this.currentFloor = this.mapsindoors.getFloor().toString();
        });
    }

    /**
     * Called after every render().
     */
    componentDidRender(): void {
        if (!this.mapsindoors.getBuilding() || this.mapsindoors.getFloor() === null || this.mapsindoors.getFloor() === undefined) {
            this.floorSelectorElement.classList.add('mi-floor-selector--hidden');
        } else {
            this.floorSelectorElement.classList.remove('mi-floor-selector--hidden');
        }

        this.currentFloorElement = this.el.querySelector('.mi-floor-selector__floor--active');

        if (this.currentFloorElement && this.currentFloor) {
            this.animateFloorSelector();
        }
    }

    /**
     * Renders the floor selector.
     *
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return (
            <Host>
                <div
                    class='mi-floor-selector'
                    ref={(element): HTMLDivElement => this.floorSelectorElement = element as HTMLDivElement}>
                    <button
                        class={`mi-floor-selector__button mi-floor-selector__button--${this.floorSelectorClosed ? 'closed' : 'open'}`}
                        onClick={(): void => this.onToggleFloorSelector()}>
                    </button>

                    <div
                        class={`mi-floor-selector__list ${this.fadeFloorSelectorOnTop ? 'mi-floor-selector__list--fade-top' : ''} ${this.fadeFloorSelectorOnBottom ? 'mi-floor-selector__list--fade-bottom' : ''}`}
                        ref={(element): HTMLDivElement => this.floorListElement = element as HTMLDivElement}
                        onScroll={(): void => this.onScrollStyle()}>
                        {this.floors.map((floor) => (
                            <button
                                data-floor={floor.index}
                                style={this.currentFloor === floor.index ? { backgroundColor: this.primaryColor } : {}}
                                class={`mi-floor-selector__floor ${this.currentFloor === floor.index ? 'mi-floor-selector__floor--active' : ''}`}
                                onClick={(event: PointerEvent): void => this.onSelectFloor(event, floor.index)}>
                                <span>{floor.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Host>
        );
    }
}