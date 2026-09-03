import { act, render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import SplashScreen from './SplashScreen';
import initI18n from '../../i18n/initialize.js';
import primaryColorState from '../../atoms/primaryColorState';
import logoState from '../../atoms/logoState';

function renderSplash(props) {
    return render(
        <RecoilRoot initializeState={({ set }) => {
            set(primaryColorState, '#005655');
            set(logoState, 'https://example.com/logo.png');
        }}>
            <SplashScreen {...props} />
        </RecoilRoot>
    );
}

describe('SplashScreen', () => {
    test('shows only the current applying-to-map status', () => {
        renderSplash({ phase: 'applying_to_map', progress: 0.95 });

        expect(screen.getByRole('status')).toHaveTextContent('Adding locations');
        expect(screen.queryByText('Preparing your map')).not.toBeInTheDocument();
        expect(screen.queryByText('Finding places')).not.toBeInTheDocument();
    });

    test('renders a progress bar and the current stage without i18n initialized', () => {
        renderSplash({ phase: 'fetching_locations', progress: 0.35 });

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '35');
        expect(screen.getByRole('status')).toHaveTextContent('Finding places');
    });

    test('shows 2D and 3D labels only as the current status', () => {
        const { rerender } = renderSplash({ phase: 'building_geometry', progress: 0.55 });

        expect(screen.getByRole('status')).toHaveTextContent('Drawing the map');
        expect(screen.queryByText('Adding 3D models')).not.toBeInTheDocument();

        rerender(
            <RecoilRoot initializeState={({ set }) => {
                set(primaryColorState, '#005655');
                set(logoState, 'https://example.com/logo.png');
            }}>
                <SplashScreen
                    phase="loading_3d_models"
                    progress={0.88}
                />
            </RecoilRoot>
        );

        expect(screen.getByRole('status')).toHaveTextContent('Adding 3D models');
        expect(screen.queryByText('Adding 2D models')).not.toBeInTheDocument();
        expect(screen.queryByText('Drawing the map')).not.toBeInTheDocument();
    });

    test('survives i18n initializing after the first render', () => {
        renderSplash({ phase: 'fetching_locations', progress: 0.35 });

        expect(screen.getByRole('status')).toHaveTextContent('Finding places');

        act(() => {
            initI18n('da');
        });

        expect(screen.getByRole('status')).toHaveTextContent('Finder steder');
    });

    test('uses translated labels once i18n is initialized', () => {
        initI18n('da');
        renderSplash({ phase: 'fetching_locations', progress: 0.35 });

        expect(screen.getByRole('status')).toHaveTextContent('Finder steder');
    });
});
