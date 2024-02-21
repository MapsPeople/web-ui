import { Component, ComponentInterface, Host, h, Watch, Event, EventEmitter } from '@stencil/core';
import { JSX, Prop, Method } from '@stencil/core/internal';
import Debounce from 'debounce-decorator';

declare const google;
declare const mapsindoors;
declare const mapboxgl;

@Component({
    tag: 'mi-search',
    styleUrl: 'search.scss'
})
/**
 * The MapsIndoors SDK must be available as a global variable.
 */
export class Search implements ComponentInterface {

    /**
     * Event emitted when searching is complete.
     */
    @Event() results: EventEmitter<object[]>;

    /**
     * Event emitted when the search field is emptied.
     */
    @Event() cleared: EventEmitter<void>;

    /**
     * Event emitted after every component rendering.
     */
    @Event() componentRendered: EventEmitter<void>;

    /**
     * Event emitted whenever the search field contains only one character.
     */
    @Event() shortInput: EventEmitter<void>;

    /**
     * Event emitted whenever the value of the input field has changed.
     */
    @Event() changed: EventEmitter<void>;

    /**
     * Placeholder for the input field.
     */
    @Prop() placeholder: string = '';

    /**
     * Id for the input field.
     */
    @Prop() idAttribute: string = '';

    /**
     * Data attributes for the input field.
     */
    @Prop() dataAttributes: { [key: string]: string } = {};

    /**
     * If searching should include MapsIndoors locations.
     */
    @Prop() mapsindoors: boolean = false;

    /**
     * If searching should include Google Places autocomplete suggestions.
     *
     * Remember to comply to Google's policy by showing a "Power By Google" badge somewhere on your
     * page if not already showing a Google map: https://developers.google.com/places/web-service/policies
     */
    @Prop() google: boolean = false;

    /**
     * If searching should include Mapbox autocomplete suggestions.
     */
    @Prop() mapbox: boolean = false;

    /**
     * The language used when retrieving Google Places or Mapbox autocomplete suggestions.
     */
    @Prop() language: string = 'en';

    /**
     * Which fields on MapsIndoors locations to search in. Comma separated string.
     */
    @Prop() miFields: string = 'name,description,aliases,categories,externalId';

    /**
     * Restrict how many Mapsindoors results to request.
     */
    @Prop() miTake: number;

    /**
     * Tell Mapsindoors to skip a number of results. Combine with miTake for pagination purposes.
     */
    @Prop() miSkip: number;

    /**
     * Specify Mapsindoors search ordering
     */
    @Prop() miOrder: string;

    /**
     * Search only Mapsindoors locations within given categories.
     * Accepts comma separated list of categories, eg. 'toilet,office'
     */
    @Prop() miCategories: string;

    /**
     * Search for MapsIndoors locations near a point.
     * Can either be lat,lng coordinate as a string, eg. '-12.3456,45.6789' or a string in the format "type:id" e.g. "venue:586ca9f1bc1f5702406442b6"
     */
    @Prop() miNear: string;

    /**
     * Restrict search results to a speficic venue (id or name)
     */
    @Prop() miVenue: string;

    /**
     * Restrict Google Places search to a specific country (two-character, ISO 3166-1 Alpha-2 compatible country code)
     */
    @Prop() gmCountryCode: string;

    /**
     * Get or set the entered value
     */
    @Prop({ mutable: true, reflect: true }) value: string;

    /**
     * Make the search field disabled
     */
    @Prop() disabled: boolean = false;

    /**
     * The Mapbox Session Token used for getting Mapbox autocomplete suggestions.
     */
    @Prop() sessionToken: string;

    /**
     * The user position which can determine the proximity for the Mapbox places results.
     */
    @Prop() userPosition: string;

    /**
     * Sets the prevention of the search.
     */
    private preventSearch: boolean = false;

    @Watch('value')
    valueChange(newValue): void {
        if (!newValue || !this.inputElement) {
            return;
        }

        if (newValue !== this.inputElement.value) {
            // If newValue is different from what is in the input element, we know it's set from outside the component.
            this.inputElement.value = newValue;

            if (!this.preventSearch) {
                this.inputChanged();
            }
        }
    }

    /**
     * Clear the input field.
     */
    @Method()
    async clear(): Promise<void> {
        this.inputElement.value = '';
        this.value = '';
        this.lastRequested = null;
        this.cleared.emit();
    }

    /**
     * Programmatically trigger the search.
     */
    @Method()
    triggerSearch(): void {
        const inputValue = this.inputElement.value;
        this.search(inputValue);
    }

    /**
     * Sets text to be shown in the search field.
     * Setting it will not perform a search.
     */
    @Method()
    setDisplayText(displayText: string): void {
        this.preventSearch = true;
        this.inputElement.value = displayText;
        this.value = displayText;
        this.preventSearch = false;
    }

    /**
     * Set focus on the input field.
     * The preventScroll boolean is passed as true to prevent the browser
     * from scrolling the document to bring the newly-focused element into view.
     */
    @Method()
    focusInput(): void {
        this.inputElement.focus({ preventScroll: true });
    }

    /**
     * Get hold of the search input field.
     */
    @Method()
    public async getInputField(): Promise<HTMLInputElement> {
        return this.inputElement;
    }

    /**
     * Perform the search.
     */
    private search(inputValue): void {
        Promise.all([
            this.makeMapsIndoorsQuery(inputValue),
            this.makeGooglePlacesQuery(inputValue),
            this.getMapboxSearchResults(inputValue),
        ])
            .then(results => {
                this.lastRequested = inputValue;

                if (this.google) {
                    this.pushResults(results[0].concat(results[1]));
                } else if (this.mapbox && mapboxgl.accessToken) {
                    this.pushResults(results[0].concat(results[2]));
                } else {
                    this.pushResults(results[0]);
                }
            });
    }

    /**
     * The input element
     */
    private inputElement: HTMLInputElement;

    /**
     * Holds the input value of the last fired request.
     * Used to prevent firing the same requests subsequently.
     */
    private lastRequested: string;

    /**
     * Holds a Google Places AutocompleteService.
     */
    private googleAutocompleteService: google.maps.places.AutocompleteService;

    /**
     * Handles incoming input change event, eg. input field value has changed.
     * The function is debounced 500ms to avoid firing too many requests while typing.
     */
    @Debounce(500)
    private inputChanged(): void {
        const inputValue = this.inputElement.value;
        this.value = inputValue; // reflect on value attribute

        if (!this.preventSearch) {
            if (inputValue.length < 2) {
                this.lastRequested = null;

                if (inputValue.length === 1) {
                    this.shortInput.emit();
                } else {
                    this.clear();
                }

                return;
            }

            if (inputValue.length > 1 && inputValue !== this.lastRequested) {
                this.search(inputValue);
            }
            this.changed.emit();
        }
    }

    /**
     * Push the results via the results event.
     * @param object[] Locations
     */
    private pushResults(locations: []): void {
        this.results.emit(locations);
    }

    /**
     * Make MapsIndoors locations request based on given search query.
     * @param {string} query
     * @return {Promise<any[]>}
     */
    private makeMapsIndoorsQuery(query: string): Promise<any> {
        if (!this.mapsindoors) {
            return Promise.resolve([]);
        }

        // Transform miNear string attribute to object if it matches a latlng
        let miNear;
        if (this.miNear) {
            miNear = this.miNear;
            if (/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/.test(this.miNear)) {
                const near = this.miNear.split(',');
                miNear = { lat: parseFloat(near[0]), lng: parseFloat(near[1]) };
            }
        }

        return mapsindoors.services.LocationsService.getLocations({
            q: query.trim(),
            fields: this.miFields,
            take: this.miTake,
            skip: this.miSkip,
            orderBy: this.miOrder,
            near: miNear,
            venue: this.miVenue,
            categories: this.miCategories
        });
    }

    /**
     * Make Google Places autocomplete suggestion request.
     *
     * @param {string} query
     * @return {Promise<any>}
     */
    private makeGooglePlacesQuery(query: string): Promise<any> {
        if (this.google) {
            if (!this.googleAutocompleteService) {
                this.googleAutocompleteService = new google.maps.places.AutocompleteService();
            }
        } else {
            this.googleAutocompleteService = null;
        }

        if (!this.googleAutocompleteService) {
            return Promise.resolve([]);
        }

        return new Promise((resolve) => {
            const params: google.maps.places.AutocompletionRequest = {
                input: query,
                language: this.language
            };

            if (this.gmCountryCode) {
                params.componentRestrictions = { country: this.gmCountryCode };
            }

            this.googleAutocompleteService.getPlacePredictions(params, (results): void => {
                const places: object[] = (results || []).map((result): object => ({
                    id: result.place_id,
                    type: 'Feature',
                    properties: {
                        type: 'google_places',
                        placeId: result.place_id,
                        name: result.structured_formatting.main_text,
                        subtitle: result.structured_formatting.secondary_text || '',
                        floor: 0
                    }
                }));
                resolve(places);
            });
        });
    }

    /**
     * Get Mapbox Places results.
     *
     * @param {string} query
     * @return {Promise<any>}
     */
    private getMapboxSearchResults(query: string): Promise<any> {
        if (this.mapbox && mapboxgl.accessToken) {
            if (query) {
                return new Promise((resolve) => {
                    const language = this.language.split('-')[0]; // Mapbox seemingly only supports the primary language subtag.
                    let url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${query}&session_token=${this.sessionToken}&access_token=${mapboxgl.accessToken}&language=${language}`;

                    if (this.userPosition) {
                        url = url.concat(`&proximity=${this.userPosition}`);
                    }

                    fetch(url)
                        .then((response) => {
                            return response.json();
                        })
                        .then((result) => {
                            const places = result.suggestions.map((result) => ({
                                id: result.mapbox_id,
                                type: 'Feature',
                                properties: {
                                    type: 'mapbox_places',
                                    placeId: result.mapbox_id,
                                    name: result.name,
                                    subtitle: result.place_formatted || '',
                                    floor: 0
                                }
                            }));
                            resolve(places);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            }
        } else {
            return Promise.resolve([]);
        }
    }

    componentDidRender(): void {
        if (this.dataAttributes) {
            for (const key in this.dataAttributes) {
                this.inputElement.setAttribute(key, this.dataAttributes[key]);
            }
        }
        this.componentRendered.emit();
    }

    render(): JSX.Element {
        return (
            <Host>
                <input
                    disabled={this.disabled}
                    id={this.idAttribute ? this.idAttribute : null}
                    type="search"
                    ref={(el) => this.inputElement = el as HTMLInputElement}
                    onInput={(): void => this.inputChanged()}
                    placeholder={this.placeholder}
                    autocomplete="off"
                />
                {this.inputElement?.value &&
                    <button type="button" onClick={() => this.clear()} aria-label="Clear">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" />
                        </svg>
                    </button>
                }
            </Host>
        );
    }
}
