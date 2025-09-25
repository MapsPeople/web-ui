import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import useNear from '../../../hooks/useNear';
import { useRecoilValue } from 'recoil';
import userPositionState from '../../../atoms/userPositionState';
import languageState from '../../../atoms/languageState';
import currentVenueNameState from '../../../atoms/currentVenueNameState';
import searchAllVenuesState from '../../../atoms/searchAllVenues';
import isChatModeEnabledState from '../../../atoms/isChatModeEnabledState';
import PropTypes from 'prop-types';

/**
 * React wrapper around the custom element <mi-search>.
 *
 * @param {object} props
 * @param {string} props.placeholder - Placeholder in search field.
 * @param {boolean} props.mapsindoors - Set to true to search in MapsIndoors Locations.
 * @param {function} props.results - Function that is called when search results are received.
 * @param {function} props.clicked - Function that is called when search field is clicked.
 * @param {function} props.cleared - Function that is called when search field is cleared.
 * @param {function} props.changed - Function that is called when value of the input field is changed.
 * @param {string} props.category - If set, search will be performed for Locations having this category.
 * @param {boolean} props.preventFocus - If set to true, the search field will be disabled.
 * @param {boolean} props.google - Set to true to include results from Google Places autocomplete service.
 * @param {boolean} props.mapbox - Set to true to include results from Mapbox Places autocomplete service.
 */
const SearchField = forwardRef(function SearchFieldComponent(props, ref) {
    const { placeholder, mapsindoors, results, clicked, cleared, changed, category, google, mapbox, disabled = false, onKeyDown } = props;
    const elementRef = useRef();

    const userPosition = useRecoilValue(userPositionState);
    const language = useRecoilValue(languageState);

    const mapboxPlacesSessionToken = sessionStorage.getItem('mapboxPlacesSessionToken');

    const userPositionCoordinates = {
        longitude: userPosition?.coords.longitude,
        latitude: userPosition?.coords.latitude,
    }

    /** Instruct the search field to search for Locations near the map center. */
    const searchNear = useNear();

    const currentVenueName = useRecoilValue(currentVenueNameState);
    const isChatModeEnabled = useRecoilValue(isChatModeEnabledState);

    const searchAllVenues = useRecoilValue(searchAllVenuesState);

    /**
     * Methods that can be triggered on the mi-search element.
     */
    useImperativeHandle(ref, () => ({
        triggerSearch() {
            elementRef.current.triggerSearch()
        },
        getValue() {
            return elementRef.current.value;
        },
        setDisplayText(displayText) {
            elementRef.current.setDisplayText(displayText);
        },
        focusInput() {
            elementRef.current.focusInput();
        },
        clear() {
            elementRef.current.clear();
        },
        getInputField() {
            return elementRef.current.getInputField();
        }
    }));

    useEffect(() => {
        const { current } = elementRef;

        if (current.value) {
            window.mapsindoors.services.LocationsService.once('update_completed', () => {
                current.triggerSearch();
            });
        }
    }, [language]);

    useEffect(() => {
        const searchResultsHandler = customEvent => results(customEvent.detail);
        const onCleared = () => cleared();

        const { current } = elementRef;

        if (mapsindoors === true) {
            current.mapsindoors = 'true';
        }

        current.addEventListener('results', searchResultsHandler);
        current.addEventListener('click', clicked);
        current.addEventListener('cleared', onCleared);
        current.addEventListener('changed', changed);

        return () => {
            current.removeEventListener('results', searchResultsHandler);
            current.removeEventListener('click', clicked);
            current.removeEventListener('cleared', onCleared);
            current.removeEventListener('changed', changed);
        }

    }, [placeholder, mapsindoors, results, clicked, cleared, google, mapbox, changed]);


    // Attach native input 'keydown' listener coming from the parent via onKeyDown.
    // We need to resolve the web-component's internal input (Promise) and add the listener.
    useEffect(() => {
        if (!onKeyDown || !elementRef.current) return;

        let cancelled = false;
        let handler = null;

        elementRef.current.getInputField().then(inputElement => {
            if (cancelled || !inputElement) return;
            handler = (event) => onKeyDown(event, elementRef.current?.value);
            inputElement.addEventListener('keydown', handler);
        }).catch(() => {
            // swallow - just don't attach the listener if getInputField fails
        });

        return () => {
            cancelled = true;
            if (!handler) return;
            // try remove the handler if the input resolves later as well
            elementRef.current?.getInputField().then(inputElement => {
                if (inputElement && handler) inputElement.removeEventListener('keydown', handler);
            }).catch(() => { });
        };
    }, [onKeyDown]);

        // Effect to find and manipulate the background-image based on chat mode
        // TODO: This is a hack to get the chat mode icon to work. We should find a better way to do this.
        useEffect(() => {
            if (!elementRef.current) return;

            const findAndUpdateBackgroundImage = async () => {
                try {
                    // Get the input element from the web component
                    const inputElement = await elementRef.current.getInputField();
                    
                    if (inputElement) {
                        if (isChatModeEnabled) {
                            // Hide the background image when chat mode is enabled
                            inputElement.style.backgroundImage = 'none';
                            
                            // Create and inject chat mode icon
                            const existingIcon = inputElement.parentElement?.querySelector('.chat-mode-icon');
                            if (!existingIcon) {
                                const iconContainer = document.createElement('div');
                                iconContainer.className = 'chat-mode-icon';
                                iconContainer.style.cssText = `
                                    position: absolute;
                                    left: var(--spacing-medium, 12px);
                                    top: 50%;
                                    transform: translateY(-50%);
                                    z-index: 10;
                                    pointer-events: none;
                                    width: 18px;
                                    height: 18px;
                                `;
                                
                                // Create SVG element
                                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                svg.setAttribute('width', '18');
                                svg.setAttribute('height', '18');
                                svg.setAttribute('viewBox', '0 0 24 24');
                                svg.setAttribute('fill', 'none');
                                svg.innerHTML = `
                                    <path d="M12.0002 4C8.43131 4 5.48489 6.67174 5.05443 10.1237C4.98609 10.6718 4.48642 11.0607 3.93838 10.9923C3.39034 10.924 3.00146 10.4243 3.0698 9.87626C6.2354 5.43564 7.4099 2 12.0002 2C16.9708 2 21.0002 6.02944 21.0002 11C21.0002 13.1253 20.2638 15.0782 19.0321 16.6178L21.7072 19.2929C22.0977 19.6834 22.0977 20.3166 21.7072 20.7071C21.3167 21.0976 20.6835 21.0976 20.293 20.7071L17.6178 18.0319C16.3539 19.0427 14.8114 19.72 13.1238 19.9304C12.5758 19.9988 12.0761 19.6099 12.0078 19.0618C11.9395 18.5138 12.3283 18.0141 12.8764 17.9458C16.3284 17.5154 19.0002 14.5689 19.0002 11C20.0002 7.13401 15.8662 4 12.0002 4Z" fill="#959595" style="fill:#959595;fill:color(display-p3 0.5849 0.5849 0.5849);fill-opacity:1;"/>
                                    <path d="M7.32918 12.2764C7.14498 11.9079 6.61897 11.9079 6.43477 12.2764L5.45647 14.2329C5.40817 14.3297 5.32968 14.4081 5.23288 14.4565L3.27637 15.4348C2.90788 15.619 2.90788 16.1449 3.27637 16.3292L5.23288 17.3074C5.32968 17.3558 5.40817 17.4343 5.45647 17.531L6.43477 19.4875C6.61897 19.8561 7.14498 19.8561 7.32918 19.4875L8.30748 17.531C8.35578 17.4343 8.43427 17.3558 8.53107 17.3074L10.4876 16.3292C10.8561 16.1449 10.8561 15.619 10.4876 15.4348L8.53107 14.4565C8.43427 14.4081 8.35578 14.3297 8.30748 14.2329L7.32918 12.2764Z" fill="#959595" style="fill:#959595;fill:color(display-p3 0.5849 0.5849 0.5849);fill-opacity:1;"/>
                                `;
                                
                                iconContainer.appendChild(svg);
                                inputElement.parentElement?.appendChild(iconContainer);
                            }
                        } else {
                            // Restore the original background image when chat mode is disabled
                            inputElement.style.backgroundImage = '';
                            
                            // Remove chat mode icon
                            const existingIcon = inputElement.parentElement?.querySelector('.chat-mode-icon');
                            if (existingIcon) {
                                existingIcon.remove();
                            }
                        }
                    }
                } catch (error) {
                    // Fallback: try to find input element directly
                    const searchElement = elementRef.current;
                    const inputElement = searchElement.shadowRoot?.querySelector('input') || 
                                        searchElement.querySelector('input');
                    
                    if (inputElement) {
                        if (isChatModeEnabled) {
                            inputElement.style.backgroundImage = 'none';
                        } else {
                            inputElement.style.backgroundImage = '';
                        }
                    }
                }
            };

            // Try to update immediately
            findAndUpdateBackgroundImage();
        }, [isChatModeEnabled]);

    return <mi-search ref={elementRef}
        id-attribute="search"
        placeholder={placeholder}
        session-token={mapboxPlacesSessionToken}
        user-position={(userPositionCoordinates.latitude !== undefined && userPositionCoordinates.longitude !== undefined) ? Object.values(userPositionCoordinates).join(',') : null}
        mi-near={searchNear}
        mi-categories={category}
        disabled={disabled}
        mapbox={mapbox}
        google={google}
        mi-venue={searchAllVenues ? undefined : currentVenueName}
        language={language}
    />
});

SearchField.propTypes = {
    placeholder: PropTypes.string,
    mapsindoors: PropTypes.bool,
    results: PropTypes.func,
    clicked: PropTypes.func,
    cleared: PropTypes.func,
    changed: PropTypes.func,
    category: PropTypes.string,
    preventFocus: PropTypes.bool,
    google: PropTypes.bool,
    mapbox: PropTypes.bool,
    disabled: PropTypes.bool,
    onKeyDown: PropTypes.func
};

export default SearchField;
