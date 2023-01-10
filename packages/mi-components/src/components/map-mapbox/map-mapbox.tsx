import { Component, ComponentInterface, h, JSX, Prop, Watch, Method, Event, EventEmitter, Host } from '@stencil/core';
import miVariables from './../../utils/mi-variables';
import { Location } from '@mapsindoors/typescript-interfaces';
import { FloorSelectorControl } from './controls/floor-selector-control';
import { MyPositionControl } from './controls/my-position-control';

declare const mapboxgl;
declare const mapsindoors;

@Component({
    tag: 'mi-map-mapbox',
    styleUrl: 'map-mapbox.scss',
    shadow: true
})
export class MapMapbox implements ComponentInterface {

    /**
     * The MapBox access token.
     * @type {string}
     */
    @Prop() accessToken: string;

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
     * @type {('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')}
     */
    @Prop() floorSelectorControlPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    @Watch('floorSelectorControlPosition')
    floorSelectorControlPositionChange(newPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): void {
        if (this.floorSelectorControl) {
            this.setFloorSelectorControl(newPosition);
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
     * @type {('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')}
     */
    @Prop() myPositionControlPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    @Watch('myPositionControlPosition')
    myPositionControlPositionChange(newPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): void {
        this.setMyPositionControl(newPosition);
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
     * Set or get the current zoom level of the map.
     * @type {string}
     */
    @Prop({ mutable: true, reflect: true }) zoom: string = '17';
    @Watch('zoom')
    zoomChange(newZoom, oldZoom): void {
        if (newZoom !== oldZoom && newZoom !== this.mapboxInstance.getZoom()) {
            if (newZoom === null) {
                newZoom = 0; // Setting the DOM attribute to "0" will be passed on here as null, so we need to circumvent that.
            }
            this.mapboxInstance.setZoom(newZoom);
        }
    }

    /**
     * Set or get the max pitch of the map (0-85).
     * @type {number}
     */
      @Prop({ mutable: true, reflect: true }) maxPitch: number = 60;
      @Watch('maxPitch')
      maxPitchChange(newPitch, oldPitch): void {
          if (newPitch !== oldPitch && newPitch !== this.mapboxInstance.getMaxPitch()) {
              if (newPitch === null) {
                  newPitch = 0; // Setting the DOM attribute to "0" will be passed on here as null, so we need to circumvent that.
              }
              this.mapboxInstance.setMaxPitch(newPitch);
          }
      }

    /**
     * Set or get the max zoom level of the map.
     * @type {string}
     */
    @Prop({ mutable: true, reflect: true }) maxZoom: string = undefined;
    @Watch('maxZoom')
    maxZoomChange(newZoom, oldZoom): void {
        if (newZoom !== oldZoom && newZoom !== this.mapboxInstance.getMaxZoom()) {
            if (newZoom === null) {
                newZoom = 0; // Setting the DOM attribute to "0" will be passed on here as null, so we need to circumvent that.
            }
            this.mapboxInstance.setMaxZoom(newZoom);
        }
    }

    /**
     * Set or get the bearing of the map.
     * @type {string}
     */
    @Prop({ mutable: true, reflect: true }) bearing: string = '0';
    @Watch('bearing')
    bearingChange(newBearing, oldBearing): void {
        if (newBearing !== oldBearing && newBearing !== this.mapboxInstance.getBearing()) {
            if (newBearing === null) {
                newBearing = 0; // Setting the DOM attribute to "0" will be passed on here as null, so we need to circumvent that.
            }
            this.mapboxInstance.setBearing(newBearing);
        }
    }

    /**
     * Set or get the pitch (tilt) of the map. Measured in degrees (0-60).
     * @type {string}
     */
    @Prop({ mutable: true, reflect: true }) pitch: string = '0';
    @Watch('pitch')
    pitchChange(newPitch, oldPitch): void {
        if (newPitch !== oldPitch && newPitch !== this.mapboxInstance.getPitch()) {
            if (newPitch === null) {
                newPitch = 0; // Setting the DOM attribute to "0" will be passed on here as null, so we need to circumvent that.
            }
            this.mapboxInstance.setPitch(newPitch);
        }
    }

    /**
     * Set the component language. Default set to English (en). Will not react to changes.
     */
    @Prop() language: string = 'en';

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
        return Promise.resolve(this.mapboxInstance);
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
    mapboxInstance;
    mapsIndoorsInstance;

    // Map Controls
    floorSelectorControl: FloorSelectorControl;
    myPositionControl: MyPositionControl;

    // Directions render and service instances
    directionsRendererInstance = null;
    directionsServiceInstance;

    highlightedLocationId: string;

    async componentDidLoad(): Promise<void> {
        await this.insertMapBoxScript();
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
     * Inject script tag for Mapbox API onto the page.
     *
     * @returns {Promise<void>}
     */
    insertMapBoxScript(): Promise<void> {
        if (typeof (mapboxgl) === 'undefined') {
            return new Promise(resolve => {
                const mapboxApiTag = document.createElement('script');
                mapboxApiTag.setAttribute('type', 'text/javascript');
                // When upgrading the version please remember to update url to the MapBox css in the render function.
                mapboxApiTag.setAttribute('src', 'https://api.mapbox.com/mapbox-gl-js/v2.3.0/mapbox-gl.js');
                document.body.appendChild(mapboxApiTag);
                mapboxApiTag.onload = () => resolve();
            });
        }
    }

    /**
     * Ensure that MapsIndoors Web SDK is available.
     *
     * @returns {Promise<void>}
     */
    initializeMapsIndoorsSDK(): Promise<void> {
        return new Promise((resolve) => {
            if (typeof mapsindoors !== 'undefined') {
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
     * Start MapBox and MapsIndoors.
     */
    setupMap(): Promise<void> {
        return new Promise((resolve) => {
            const mapViewOptions: any = {
                accessToken: this.accessToken,
                element: this.mapElement,
                zoom: this.zoom,
                maxZoom: this.maxZoom,
                maxPitch: this.maxPitch,
                bearing: this.bearing,
                pitch: this.pitch
            };
            const mapViewInstance = new mapsindoors.mapView.MapboxView(mapViewOptions);
            this.mapboxInstance = mapViewInstance.getMap();

            this.mapsIndoorsInstance = new mapsindoors.MapsIndoors({
                mapView: mapViewInstance,
                labelOptions: {
                    pixelOffset: { width: 0, height: 14 },
                    style: {
                        fontSize: '11px'
                    }
                }
            });

            // Add zoom and rotation controls
            const navigationControl = new mapboxgl.NavigationControl();
            this.mapboxInstance.addControl(navigationControl, 'top-left');

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
        const externalDirections = new mapsindoors.directions.MapboxProvider(this.accessToken);
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
        // Add click listener to highlight the clicked location
        this.mapsIndoorsInstance.on('click', (location: Location) => {
            this.highlightLocation(location);
        });

        // Add floor changed event listener to update the floorIndex attribute
        this.mapsIndoorsInstance.on('floor_changed', (floorIndex: string) => {
            this.floorIndex = floorIndex;
        });

        // Add zoom end event listener to update the zoom attribute
        this.mapboxInstance.on('zoomend', () => {
            this.zoom = this.mapboxInstance.getZoom().toString();
        });

        // Add pitch (tilt) end listener to update the pitch attribute
        this.mapboxInstance.on('pitchend', () => {
            this.pitch = this.mapboxInstance.getPitch().toString();
        });

        // Add rotate end listener to update the bearing attribute
        this.mapboxInstance.on('rotateend', () => {
            this.bearing = this.mapboxInstance.getBearing().toString();
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
     * Show the floor selector after user interacts with map.
     * Sets up event listener what when invoked will set the floor selector on the map.
     */
    showFloorSelector(): void {
        this.setFloorSelectorControl(this.floorSelectorControlPosition);
    }

    /**
     * Set, update or unset floor selector on the map.
     * @param {('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')} controlPosition
     */
    setFloorSelectorControl(controlPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): void {
        if (controlPosition === null) {
            // If attribute is not set, remove floor selector control
            this.mapboxInstance.removeControl(this.floorSelectorControl);
            this.floorSelectorControl = null;
        } else if (!this.floorSelectorControl) {
            // Create new floor selector control
            this.floorSelectorControl = new FloorSelectorControl(this.mapboxInstance, this.mapsIndoorsInstance);
            this.mapboxInstance.addControl(this.floorSelectorControl, this.floorSelectorControlPosition);
        } else {
            // Update position of floor selector control
            this.mapboxInstance.removeControl(this.floorSelectorControl);
            this.mapboxInstance.addControl(this.floorSelectorControl, this.floorSelectorControlPosition);
        }
    }

    /**
     * Set, update or unset my position control on the map.
     * @param {('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')} controlPosition
     */
    setMyPositionControl(controlPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): void {
        if (controlPosition === null) {
            // If attribute is not set, remove my position control
            this.mapboxInstance.removeControl(this.myPositionControl);
            this.myPositionControl = null;
        } else if (!this.myPositionControl) {
            // Create new my position control
            this.myPositionControl = new MyPositionControl(this.mapboxInstance, this.mapsIndoorsInstance);
            this.mapboxInstance.addControl(this.myPositionControl, this.myPositionControlPosition);
        } else {
            // Update position of my position control
            this.mapboxInstance.removeControl(this.myPositionControl);
            this.mapboxInstance.addControl(this.myPositionControl, this.myPositionControlPosition);
        }
    }

    render(): JSX.Element {
        return (
            <Host>
                <link href='https://api.mapbox.com/mapbox-gl-js/v2.3.0/mapbox-gl.css' rel='stylesheet' />
                <div ref={(el) => this.mapElement = el as HTMLDivElement}></div>
            </Host>
        );
    }
}
