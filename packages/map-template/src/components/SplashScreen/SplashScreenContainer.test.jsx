import { act, render, screen } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import SplashScreenContainer from './SplashScreenContainer';
import appConfigState from '../../atoms/appConfigState';
import notificationMessageState from '../../atoms/notificationMessageState';
import primaryColorState from '../../atoms/primaryColorState';
import logoState from '../../atoms/logoState';

describe('SplashScreenContainer', () => {
    test('shows the splash and hides it when a load error is reported', () => {
        const controls = {};

        function ErrorControls() {
            controls.setError = useSetRecoilState(notificationMessageState);
            return null;
        }

        render(
            <RecoilRoot initializeState={({ set }) => {
                set(appConfigState, {});
                set(primaryColorState, '#005655');
                set(logoState, 'https://example.com/logo.png');
            }}>
                <ErrorControls />
                <SplashScreenContainer mapsindoorsSDKAvailable={true} />
            </RecoilRoot>
        );

        expect(screen.getByRole('status')).toBeInTheDocument();

        act(() => {
            controls.setError({
                text: 'Please provide a Mapbox Access Token or Google Maps API key to show a map.',
                type: 'error'
            });
        });

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
