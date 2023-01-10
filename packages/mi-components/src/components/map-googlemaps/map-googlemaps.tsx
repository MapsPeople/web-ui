import { Component, ComponentInterface, h, JSX, Prop, Watch, Method, Event, EventEmitter } from '@stencil/core';
import miVariables from './../../utils/mi-variables';
import { Location } from '@mapsindoors/typescript-interfaces';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';

declare const google;
declare const mapsindoors;

@Component({
    tag: 'mi-map-googlemaps',
    styleUrl: 'map-googlemaps.scss',
    shadow: true
})
export class MapGooglemaps implements ComponentInterface {

    /**
     * The Google Maps API key.
     * @type {string}
     */
    @Prop() gmApiKey: string = '';

    /**
     * The MapsIndoors API key.
     * @type {string}
     */
    @Prop() miApiKey: string = '';
    @Watch('miApiKey')
    apiKeyChange(newApiKey): void {
        mapsindoors.MapsIndoors.setMapsIndoorsApiKey(newApiKey);
    }

    /**
     * Google Maps options. Defaults to zoom: 17, maxZoom: 21, center: { lat: 0, lng: 0 }, mapTypeControl: false, streetViewControl: false.
     * https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
     * @type {google.maps.MapOptions}
     */
    @Prop() gmOptions: google.maps.MapOptions = {
        zoom: 17,
        maxZoom: 21,
        center: { lat: 0, lng: 0 },
        mapTypeControl: false,
        streetViewControl: false
    };
    @Watch('gmOptions')
    gmOptionsChange(newControlOptions): void {
        this.googleMapsInstance.setOptions(newControlOptions);
    }

    /**
     * Set to true to prevent external links on the map from opening.
     * This can be useful when running the map on a kiosk where you never want the browser to navigate away.
     * @type {boolean}
     */
    @Prop() disableExternalLinks: boolean = false;
    @Watch('disableExternalLinks')
    setExternalLinkBehavior(shouldDisableLinks: boolean): void {
        if (shouldDisableLinks === true) {
            this.mapElement.addEventListener('click', this.preventExternalLink);
        } else {
            this.mapElement.removeEventListener('click', this.preventExternalLink);
        }
    }

    /**
     * Render the floor selector as a Map Control at the given position.
     * @type {string}
     */
    @Prop() floorSelectorControlPosition: string;
    @Watch('floorSelectorControlPosition')
    floorSelectorControlPositionChange(newPosition: string, oldPosition: string): void {
        if (this.floorSelectorInstance) {
            this.setFloorSelectorControl(newPosition, oldPosition);
        }
    }

    /**
     * Set or get the current floor index shown on the map.
     * @type {string}
     */
    @Prop({ mutable: true, reflect: true }) floorIndex: string;
    @Watch('floorIndex')
    floorIndexChange(newFloor, oldFloor): void {
        if (newFloor === null) {
            newFloor = '0'; // Setting the DOM attribute to "0" will be passed on here as null, so we need to circumvent that.
        }

        if (newFloor !== oldFloor && newFloor !== this.mapsIndoorsInstance.getFloor()) {
            this.mapsIndoorsInstance.setFloor(newFloor);
        }
    }

    /**
     * Render the My Position Control as a Map Control at the given position.
     * @type {string}
     */
    @Prop() myPositionControlPosition: string;
    @Watch('myPositionControlPosition')
    myPositionControlPositionChange(newPosition: string, oldPosition: string): void {
        this.setMyPositionControl(newPosition, oldPosition);
    }

    /**
     * Styling of polygon highlight when a location is clicked.
     * Set it to null to turn off highlighting.
     * @type {object}
     */
    @Prop() polygonHighlightOptions = {
        strokeColor: '#EF6CCE',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#EF6CCE',
        fillOpacity: 0.2
    }

    /**
     * Set the component language. Default set to English (en). Will not react to changes.
     */
    @Prop() language: string = 'en';

    /**
     * Styling of how the polyline looks when getting a route.
     * Color: The stroke color of direction polyline on the map. Accepts any legal HTML color value. Default: '#307ad9'.
     * Opacity: The stroke opacity of directions polylines on the map. Numerical value between 0.0 and 1.0. Default: 1.
     * Weight: The width of the direction polyline in pixels. Default: 4.
     *
     * @type {{ color: string, weight: number, opacity: number }}
     */
    @Prop() polylineOptions: { color: string, weight: number, opacity: number } = {
        color: '#3071d9',
        opacity: 1,
        weight: 4
    }
    @Watch('polylineOptions')
    polylineOptionsChange(newPolylineOptions): void {
        if (this.directionsRendererInstance) {
            this.directionsRendererInstance.setOptions({
                strokeColor: newPolylineOptions.color ? newPolylineOptions.color : '#3071d9',
                strokeOpacity: newPolylineOptions.opacity ? newPolylineOptions.opacity : 1,
                strokeWeight: newPolylineOptions.weight ? newPolylineOptions.weight : 4
            });
        }
    }

    /**
     * Ready event emitted when the MapsIndoors has been initialized and is ready.
     * @event ready
     * @type {EventEmitter}
     */
    @Event() mapsIndoorsReady: EventEmitter;

    /**
     * Get the map instance.
     * @returns {Promise<any>}
     */
    @Method()
    async getMapInstance(): Promise<any> {
        return Promise.resolve(this.googleMapsInstance);
    }

    /**
     * Get the MapsIndoors instance.
     * @returns {Promise<any>}
     */
    @Method()
    async getMapsIndoorsInstance(): Promise<any> {
        return Promise.resolve(this.mapsIndoorsInstance);
    }

    /**
     * Get the MapsIndoors Directions Service Instance.
     * @returns {Promise<any>}
     */
    @Method()
    async getDirectionsServiceInstance(): Promise<any> {
        return Promise.resolve(this.directionsServiceInstance);
    }

    /**
     * Get the MapsIndoors Directions Renderer Instance.
     * @returns {Promise<any>}
     */
    @Method()
    async getDirectionsRendererInstance(): Promise<any> {
        return Promise.resolve(this.directionsRendererInstance);
    }

    /**
     * Highlight a MapsIndoors location. Only a single location can be highlighted at the time.
     * @param {Location} location
     * @returns {Promise<void>}
     */
    @Method()
    async highlightLocation(location: Location): Promise<void> {
        // Return if polygonHighlightOptions is undefined
        if (!this.polygonHighlightOptions) return;
        // Return if already highlighted
        if (this.highlightedLocationId && this.highlightedLocationId === location.id) return;
        // Remove previous highlight
        if (this.highlightedLocationId) {
            this.mapsIndoorsInstance.setDisplayRule(this.highlightedLocationId, null);
        }

        this.mapsIndoorsInstance.setDisplayRule(location.id, {
            polygonVisible: true,
            polygonZoomFrom: '0',
            polygonZoomTo: '22',
            zIndex: 1000,
            polygonFillColor: this.polygonHighlightOptions.fillColor,
            polygonFillOpacity: this.polygonHighlightOptions.fillOpacity,
            polygonStrokeColor: this.polygonHighlightOptions.strokeColor,
            polygonStrokeOpacity: this.polygonHighlightOptions.strokeOpacity,
            polygonStrokeWeight: this.polygonHighlightOptions.strokeWeight
        });
        this.highlightedLocationId = location.id;
    }

    /**
     * Clear existing MapsIndoors location highlight.
     * @returns {Promise<void>}
     */
    @Method()
    async clearHighlightLocation(): Promise<void> {
        if (this.highlightedLocationId) {
            this.mapsIndoorsInstance.setDisplayRule(this.highlightedLocationId, null);
            this.highlightedLocationId = null;
        }
    }

    mapElement: HTMLDivElement;

    // Map and MapsIndoors instances
    googleMapsInstance;
    mapsIndoorsInstance;

    // Floor selector instance and DOM Element
    floorSelectorInstance: HTMLElement;
    floorSelectorElement: HTMLElement;

    // Position control instance and DOM Element
    positionControlInstance: HTMLElement;
    positionControlElement: HTMLElement;

    // Directions render and service instances
    directionsRendererInstance = null;
    directionsServiceInstance;

    highlightedLocationId: string;

    async componentDidLoad(): Promise<void> {
        await this.loadGoogleMapsApi();
        await this.initializeMapsIndoorsSDK();
        await this.setupMap();

        this.setExternalLinkBehavior(this.disableExternalLinks);
        this.addEventListeners();

        if (this.floorSelectorControlPosition) {
            this.showFloorSelector();
        }

        if (this.myPositionControlPosition) {
            this.setMyPositionControl(this.myPositionControlPosition);
        }
    }

    disconnectedCallback(): void {
        this.mapsIndoorsInstance.deallocate();
        this.mapElement.remove();
        this.mapElement = null;
    }

    /**
     * Load the Google Maps API.
     *
     * @returns {Promise<void>}
     */
    loadGoogleMapsApi(): Promise<typeof google> {
        if (typeof(google) === 'undefined') {
            const loader = new GoogleMapsApiLoader({
                apiKey: this.gmApiKey,
                version: 'quarterly',
                libraries: ['geometry', 'places']
            });

            return loader.load();
        }
    }

    /**
     * Ensure that MapsIndoors Web SDK is available.
     *
     * @returns {Promise<void>}
     */
    initializeMapsIndoorsSDK(): Promise<void> {
        return new Promise((resolve) => {
            if (typeof(mapsindoors) !== 'undefined') {
                mapsindoors.MapsIndoors.setMapsIndoorsApiKey(this.miApiKey);
                mapsindoors.MapsIndoors.setLanguage(this.language);

                return resolve();
            }

            const miSdkApiTag = document.createElement('script');
            miSdkApiTag.setAttribute('type', 'text/javascript');
            miSdkApiTag.setAttribute('src', `${miVariables.miSDKUrlV4}?apikey=${this.miApiKey}`);
            document.body.appendChild(miSdkApiTag);
            miSdkApiTag.onload = (): void => resolve();
        });
    }

    /**
     * Start Google Maps and MapsIndoors.
     */
    setupMap(): Promise<void> {
        return new Promise((resolve) => {
            const mapViewOptions: any = {
                element: this.mapElement,
                ...this.gmOptions,
            };
            const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);
            this.googleMapsInstance = mapViewInstance.getMap();

            this.mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance });
            this.mapsIndoorsInstance.on('ready', async () => {
                if (this.floorIndex !== undefined) {
                    // Set the floor if floor attribute was set in the DOM initially
                    this.mapsIndoorsInstance.setFloor(this.floorIndex);
                } else {
                    this.floorIndex = this.mapsIndoorsInstance.getFloor();
                }

                this.initializeDirectionsService();
                this.initializeDirectionsRenderer();

                this.mapsIndoorsReady.emit();
                resolve();
            });
        });
    }

    /**
     * Initialize MapsIndoors Directions Service.
     */
    initializeDirectionsService(): void {
        const externalDirections = new mapsindoors.directions.GoogleMapsProvider();
        this.directionsServiceInstance = new mapsindoors.services.DirectionsService(externalDirections);
    }

    /**
     * Initialize MapsIndoors Directions Renderer with render options set.
     */
    initializeDirectionsRenderer(): void {
        this.directionsRendererInstance = new mapsindoors.directions.DirectionsRenderer({
            mapsIndoors: this.mapsIndoorsInstance,
            fitBounds: true,
            strokeColor: this.polylineOptions.color,
            strokeOpacity: this.polylineOptions.opacity,
            strokeWeight: this.polylineOptions.weight,
            visible: true
        });
    }

    /**
     * Add event listeners and keep properties in sync.
     */
    addEventListeners(): void {
        this.mapsIndoorsInstance.on('click', (location: Location) => {
            this.highlightLocation(location);
        });

        // Add floor changed event listener
        this.mapsIndoorsInstance.on('floor_changed', (floorIndex: string) => {
            this.floorIndex = floorIndex;
        });

    }

    /**
     * Prevent external links from opening.
     * @param {MouseEvent} event
     */
    preventExternalLink(event: MouseEvent): void {
        const externalLink = (event.target as Element).closest('a[target="_blank"]');
        if (externalLink) {
            event.preventDefault();
        }
    }

    /**
     * Show the floor selector.
     */
     showFloorSelector(): void {
        this.setFloorSelectorControl(this.floorSelectorControlPosition);
    }

    /**
     * Remove a Google Map Control from the map based on class name of the control.
     * @param {string} controlPosition - the position from where to remove the control
     * @param {string} className - the class name of the control to remove
     */
    removeGoogleMapControl(controlPosition: string, className: string): void {
        const controls = this.googleMapsInstance.controls[google.maps.ControlPosition[controlPosition]].getArray();
        const controlIndex = controls.findIndex(control => control.classList.contains(className));
        this.googleMapsInstance.controls[google.maps.ControlPosition[controlPosition]].removeAt(controlIndex);
    }

    /**
     * Set, update or unset floor selector on the map.
     * @param {string} controlPosition
     * @param {string} [oldControlPosition=undefined]
     */
    setFloorSelectorControl(controlPosition: string, oldControlPosition: string = undefined): void {
        if (controlPosition === null) {
            // If attribute is not set, clear control and unset floor selector.
            this.removeGoogleMapControl(oldControlPosition, 'floor-selector');
            this.floorSelectorElement = null;
            this.floorSelectorInstance = null;
        } else if (!this.floorSelectorInstance) {
            // Create new floor selector control
            this.floorSelectorElement = document.createElement('div');
            this.floorSelectorInstance = new mapsindoors.FloorSelector(this.floorSelectorElement, this.mapsIndoorsInstance);
            this.googleMapsInstance.controls[google.maps.ControlPosition[controlPosition]].push(this.floorSelectorElement);
        } else {
            // Update position of floor selector control
            this.removeGoogleMapControl(oldControlPosition, 'floor-selector');
            this.googleMapsInstance.controls[google.maps.ControlPosition[controlPosition]].push(this.floorSelectorElement);
        }
    }

    /**
     * Set, update or unset position control on the map.
     * @param {string} controlPosition
     * @param {string} oldControlPosition
     */
    setMyPositionControl(controlPosition: string, oldControlPosition: string = undefined): void {
        if (controlPosition === null) {
            // If attribute is not set, clear control and unset position control.
            this.removeGoogleMapControl(google.maps.ControlPosition[oldControlPosition], 'position-control');
            this.positionControlElement = null;
            this.positionControlInstance = null;
        } else if (!this.positionControlInstance) {
            // Create new my position control
            this.positionControlElement = document.createElement('div');
            this.positionControlInstance = new mapsindoors.PositionControl(this.positionControlElement, { mapsIndoors: this.mapsIndoorsInstance, positionOptions: { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 } });
            this.googleMapsInstance.controls[google.maps.ControlPosition[controlPosition]].push(this.positionControlElement);
        } else {
            // Update position of my position control
            this.removeGoogleMapControl(oldControlPosition, 'position-control');
            this.googleMapsInstance.controls[google.maps.ControlPosition[controlPosition]].push(this.positionControlElement);
        }
    }

    render(): JSX.Element {
        return (
            <div ref={(el) => this.mapElement = el as HTMLDivElement}></div>
        );
    }
}
