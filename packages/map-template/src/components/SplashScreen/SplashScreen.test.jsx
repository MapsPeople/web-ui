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
    test('shows the applying-to-map stage', () => {
        renderSplash({ phase: 'applying_to_map', progress: 0.95 });

        expect(screen.getByRole('status')).toHaveTextContent('Adding locations to the map');
    });

    test('renders a progress bar and the current stage without i18n initialized', () => {
        renderSplash({ phase: 'fetching_locations', progress: 0.35 });

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '35');
        expect(screen.getByRole('status')).toHaveTextContent('Fetching locations');
    });

    test('shows 2D and 3D stages only after those phases are reached', () => {
        const { rerender } = renderSplash({ phase: 'building_geometry', progress: 0.55 });

        expect(screen.queryByText('Loading 3D models')).not.toBeInTheDocument();

        rerender(
            <RecoilRoot initializeState={({ set }) => {
                set(primaryColorState, '#005655');
                set(logoState, 'https://example.com/logo.png');
            }}>
                <SplashScreen
                    phase="loading_3d_models"
                    progress={0.88}
                    seenPhases={new Set(['initializing', 'fetching_locations', 'building_geometry', 'loading_2d_models', 'loading_3d_models'])}
                />
            </RecoilRoot>
        );

        expect(screen.getAllByText('Loading 3D models').length).toBeGreaterThan(0);
        expect(screen.getByText('Loading 2D models')).toBeInTheDocument();
    });

    test('survives i18n initializing after the first render', () => {
        renderSplash({ phase: 'fetching_locations', progress: 0.35 });

        expect(screen.getByRole('status')).toHaveTextContent('Fetching locations');

        act(() => {
            initI18n('da');
        });

        expect(screen.getByRole('status')).toHaveTextContent('Henter lokationer');
    });

    test('uses translated labels once i18n is initialized', () => {
        initI18n('da');
        renderSplash({ phase: 'fetching_locations', progress: 0.35 });

        expect(screen.getByRole('status')).toHaveTextContent('Henter lokationer');
    });
});
