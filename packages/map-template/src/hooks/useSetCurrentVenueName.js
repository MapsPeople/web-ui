import { useRecoilState } from 'recoil';
import currentVenueNameState from '../atoms/currentVenueNameState';

const localStorageKeyForVenue = 'MI-MAP-TEMPLATE-LAST-VENUE';

const useSetCurrentVenueName = () => {

    const [, setCurrentVenueName] = useRecoilState(currentVenueNameState);

    return (venueName) => {
        window.localStorage.removeItem(localStorageKeyForVenue);
        setCurrentVenueName(venueName);
    };
};

export default useSetCurrentVenueName;
