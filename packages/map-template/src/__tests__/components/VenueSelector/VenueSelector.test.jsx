import { render, screen, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';  // Import atom directly
import VenueSelector from '../../../components/VenueSelector/VenueSelector';
import venuesInSolutionState from '../../../atoms/venuesInSolutionState';
import currentVenueNameState from '../../../atoms/currentVenueNameState';
import isLocationClickedState from '../../../atoms/isLocationClickedState';
import venueWasSelectedState from '../../../atoms/venueWasSelectedState';

// Mock SVG imports
jest.mock('../../../assets/building.svg', () => ({
    ReactComponent: () => <div data-testid="building-icon" />
}));
jest.mock('../../../assets/close.svg', () => ({
    ReactComponent: () => <div data-testid="close-icon" />
}));

// Mock i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

describe('VenueSelector', () => {
    const mockOnOpen = jest.fn();
    const mockOnClose = jest.fn();

    const renderVenueSelector = (props = {}) => {
        return render(
            <RecoilRoot initializeState={({ set }) => {
                set(venuesInSolutionState, [
                    {
                        id: 'venue1',
                        name: 'Main Building',
                        venueInfo: { name: 'Main Campus' }
                    },
                    {
                        id: 'venue2',
                        name: 'South Wing',
                        venueInfo: { name: 'South Campus' }
                    }
                ]);
                set(currentVenueNameState, null);
                set(isLocationClickedState, false);
                set(venueWasSelectedState, false);
            }}>
                <VenueSelector
                    onOpen={mockOnOpen}
                    onClose={mockOnClose}
                    active={props.active ?? false}
                />
            </RecoilRoot>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('renders toggle button with close icon when active', () => {
        // Render the VenueSelector with active set to true
        renderVenueSelector({ active: true });
        // Verify the close icon is rendered
        expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('calls onOpen when toggle button is clicked while inactive', () => {
        // Render the VenueSelector with active set to false
        renderVenueSelector({ active: false });
        // Find and click the toggle button using its accessible role and name
        fireEvent.click(screen.getByRole('button'));
        // Verify that onOpen was called
        expect(mockOnOpen).toHaveBeenCalled();
    });

    it('displays venue list when active', () => {
        // Render the VenueSelector with active set to true
        renderVenueSelector({ active: true });

        // Verify the venue list is displayed
        expect(screen.getByText('Select venue')).toBeInTheDocument();

        // Verify the venues are displayed in the list
        expect(screen.getByText('Main Campus')).toBeInTheDocument();
        expect(screen.getByText('South Campus')).toBeInTheDocument();
    });

    it('adds the venue-selector__button--open class when active is true', () => {
        // Render the VenueSelector with active set to false
        renderVenueSelector({ active: true });

        // Find the toggle button using its accessible role and name
        const toggleButton = screen.getByRole('button', { name: /venues/i });

        // Verify the button has the 'open' modifier class
        expect(toggleButton).toHaveClass('venue-selector__button--open');
    });

    it('does not add the venue-selector__button--open class when active is false', () => {
        // Render the VenueSelector with active set to false
        renderVenueSelector({ active: false });

        // Find the toggle button using its accessible role and name
        const toggleButton = screen.getByRole('button', { name: /venues/i });

        // Verify the button has the default class without the 'open' modifier
        expect(toggleButton).toHaveClass('venue-selector__button');
    });

    it('marks selected venue as current and updates state', () => {
        // Render the VenueSelector with active set to true
        renderVenueSelector({ active: true });

        // Find and click the Main Campus venue button
        const mainCampusVenue = screen.getByText('Main Campus').closest('button');
        fireEvent.click(mainCampusVenue);

        // Check the nested structure and current indicator
        const venueContent = mainCampusVenue.querySelector('.venue__content');
        expect(venueContent).toBeInTheDocument();
        expect(venueContent.querySelector('.venue__current')).toBeInTheDocument();

        // Verify that onClose was called (since selecting a venue closes the selector)
        expect(mockOnClose).toHaveBeenCalled();
    });
});