import midtIcon from '@mapsindoors/midt/tokens/icon.json';
import { Component, Event, EventEmitter, h, Host, JSX, Prop, State, Watch } from '@stencil/core';
import { appendMapsIndoorsImageQueryParameters } from '../../utils/utils';
import { UnitSystem } from './../../enums/unit-system.enum';

declare const mapsindoors;

@Component({
    tag: 'mi-list-item-location',
    styleUrl: 'list-item-location.scss',
    shadow: true
})
export class ListItemLocation {

    /**
     * @description Location object.
     */
    @Prop() location;

    /**
     * Whether to show the External ID.
     */
    @Prop() showExternalId: boolean = true;

    /**
     * @description Set imperial or metric as unit for distance.
     * @type {UnitSystem}
     */
    @Prop() unit: UnitSystem;

    /**
     * @description Optional URL to icon to render for the Location. If not set, imageURL on the Location data will be used.
     * @type {string}
     */
    @Prop() icon: string;

    /**
     * @description The word used for "Level" when showing level info. Default is "Level".
     */
    @Prop() level: string = 'Level';

    @Watch('icon')
    iconChanged(): void {
        this.iconURLToRender = this.icon ? this.icon : this.location?.properties.imageURL;
        this.updateBadge();
    }
    /**
     * @description Add a badge to the location icon of the type given as value.
     * @type {string}
     */
    @Prop() iconBadge: string;

    @Watch('iconBadge')
    iconBadgeChanged(): void {
        this.updateBadge();
    }

    /**
     * @description The value of the badge.
     * @type {string} For availability, use "true" or "false".
     */
    @Prop() iconBadgeValue: string;

    @Watch('iconBadgeValue')
    iconBadgeValueChanged(): void {
        this.updateBadge();
    }

    /**
     * @description Emits the clicked MI Location.
     * @type {EventEmitter<Location>}
     */
    @Event() locationClicked: EventEmitter;

    /**
     * @description Emits a component render event.
     * @type {EventEmitter}
     */
    @Event() listItemDidRender: EventEmitter;

    @State() iconURLToRender: string;

    private imageElement: HTMLImageElement;
    private infoElement: HTMLMiLocationInfoElement;
    private iconAttributes: {};
    private iconDisplaySize = parseInt(midtIcon.icon.size.medium.value);

    /**
     * @description Emits the location to event listeners.
     * @param {*} location - Location object.
     * @memberof List
     */
    locationClickedHandler(location): void {
        this.locationClicked.emit(location);
    }

    /**
     * Called once just after the component is first connected to the DOM.
     */
    componentWillLoad(): void {
        this.iconURLToRender = this.icon ? this.icon : this.location?.properties.imageURL;
        this.updateBadge();
    }

    /**
     * Called after every render().
     */
    componentDidRender(): void {
        if (!this.location) {
            return;
        }

        this.infoElement.location = this.location;
        this.listItemDidRender.emit();

        // IE fallback for 'object-fit' css property
        if (this.imageElement && 'objectFit' in document.documentElement.style === false) {
            this.objectFitImage(this.imageElement);
        }
    }

    /**
     * Apply badge to location icon.
     */
    updateBadge(): void {
        if (this.iconBadge && this.iconBadgeValue && this.iconURLToRender) {
            this.applyBadgeToIcon();
        }
    }

    /**
     * @description Set image as background image.
     * @param {HTMLImageElement} image
     */
    objectFitImage(image: HTMLImageElement): void {
        image.setAttribute('style', `background: no-repeat center center url("${this.iconURLToRender}"); background-size: cover;`);
        image.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${image.width}' height='${image.height}'%3E%3C/svg%3E`;
    }

    /**
     * Apply badge to location icon.
     * Will make the original icon appear the intended size even though the badge exceeds its bounds.
     */
    applyBadgeToIcon(): void {
        let originalIconScale;

        this.iconURLToRender = this.icon ? this.icon : this.location.properties.imageURL;

        const iconURL = appendMapsIndoorsImageQueryParameters(this.iconURLToRender, this.iconDisplaySize);
        this.getImageFromUrl(iconURL).then(image => {
            originalIconScale = image.width / 24;
            switch (this.iconBadge.toLowerCase()) {
                case 'availability':
                    if (this.iconBadgeValue === 'true') {
                        return mapsindoors.BadgeRenderer.AvailableBadge.overlay(image);
                    } else if (this.iconBadgeValue === 'false') {
                        return mapsindoors.BadgeRenderer.UnavailableBadge.overlay(image);
                    }
                    break;

                case 'occupancy':
                    return mapsindoors.BadgeRenderer.TextBadge.overlay(image, {
                        text: this.iconBadgeValue.toString()
                    });
            }
        }).then(badgedImage => {
            if (badgedImage) {
                this.iconURLToRender = badgedImage.src;

                // Badged image must be moved so the original image aligns with other.
                const translateIcon = (badgedImage.width - 24) / -2;
                this.iconAttributes = {
                    style: {
                        transform: 'translateX(' + translateIcon + 'px)',
                        width: badgedImage.width / originalIconScale + 'px',
                        height: badgedImage.height / originalIconScale + 'px'
                    }
                };
            }
        });
    }

    /**
     * Create and return an Image from URL.
     *
     * @param {string} url
     * @returns {Image}
     */
    async getImageFromUrl(url): Promise<any> {
        return fetch(url)
            .then(res => res.blob())
            .then(blob => URL.createObjectURL(blob))
            .then(objUrl => {
                return new Promise((resolve) => {
                    const image = new Image();
                    image.width = this.iconDisplaySize;
                    image.height = this.iconDisplaySize;
                    image.onload = () => resolve(image);
                    image.onerror = () => resolve(null);
                    image.src = objUrl;
                });
            });
    }

    /**
     * Render location list-item.
     *
     * @description Render location list-item.
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return this.location && (
            <Host role="listitem" onClick={() => this.locationClickedHandler(this.location)}>
                {this.iconURLToRender ? this.renderIcon() : null}

                <div class="details">
                    <p class="details-title">{this.location.properties.name}</p>
                    <mi-location-info level={this.level} ref={(el) => this.infoElement = el as HTMLMiLocationInfoElement} showExternalId={this.showExternalId}></mi-location-info>
                </div>

                {this.location.properties.geodesicDistance && this.renderDistance()}
            </Host>
        );
    }

    /**
     * @description Get JSX template for icon.
     * @returns {JSX.Element}
     */
    renderIcon(): JSX.Element {
        const iconURL = appendMapsIndoorsImageQueryParameters(this.iconURLToRender, this.iconDisplaySize);
        return (
            <div class="img-container">
                <img {...this.iconAttributes} ref={(el) => this.imageElement = el as HTMLImageElement} src={iconURL} />
            </div>
        );
    }

    /**
     * @description Get JSX template for distance.
     * @returns {JSX.Element}
     */
    renderDistance(): JSX.Element {
        return (
            <div class="distance">
                <mi-distance meters={this.location.properties.geodesicDistance} unit={this.unit}></mi-distance>
            </div>
        );
    }
}
