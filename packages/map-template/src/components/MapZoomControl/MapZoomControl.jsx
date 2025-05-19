import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import mapTypeState from '../../atoms/mapTypeState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import primaryColorState from '../../atoms/primaryColorState';
import { mapTypes } from '../../constants/mapTypes';
import { ReactComponent as PlusIcon } from '../../assets/plus.svg';
import { ReactComponent as MinusIcon } from '../../assets/minus.svg';
import './MapZoomControl.scss';

/**
 * A map  zoom control component for Google Maps and Mapbox
 */
function MapZoomControl() {
    const mapType = useRecoilValue(mapTypeState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const primaryColor = useRecoilValue(primaryColorState);
    const [map, setMap] = useState(null);

    // Set up map reference when mapsIndoorsInstance changes
    useEffect(() => {
        if (mapsIndoorsInstance?.getMapView()) {
            setMap(mapsIndoorsInstance.getMapView().getMap());
        }
    }, [mapsIndoorsInstance]);

    // Handle zoom in button click
    const handleZoomIn = () => {
        if (!map) return;

        if (mapType === mapTypes.Google) {
            map.setZoom(map.getZoom() + 1);
        } else if (mapType === mapTypes.Mapbox) {
            map.zoomIn();
        }
    };

    // Handle zoom out button click
    const handleZoomOut = () => {
        if (!map) return;

        if (mapType === mapTypes.Google) {
            map.setZoom(map.getZoom() - 1);
        } else if (mapType === mapTypes.Mapbox) {
            map.zoomOut();
            console.log('Zoom out');

        }
    };

    return (
        <div className="map-zoom-control">
            <button
                className="map-zoom-control__btn map-zoom-control__btn--plus"
                onClick={handleZoomIn}
                style={{ color: primaryColor }}
                aria-label="Zoom in"
            >
                <PlusIcon />
            </button>
            <button
                className="map-zoom-control__btn map-zoom-control__btn--minus"
                onClick={handleZoomOut}
                style={{ color: primaryColor }}
                aria-label="Zoom out"
            >
                <MinusIcon />
            </button>
        </div>
    );
}

export default MapZoomControl;