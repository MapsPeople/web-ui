import { act, render, screen } from '@testing-library/react';
import { createStore, Provider, useSetAtom } from 'jotai';
import SplashScreenContainer from './SplashScreenContainer';
import appConfigState from '../../atoms/appConfigState';
import notificationMessageState from '../../atoms/notificationMessageState';
import primaryColorState from '../../atoms/primaryColorState';
import logoState from '../../atoms/logoState';

describe('SplashScreenContainer', () => {
    test('shows the splash and hides it when a load error is reported', () => {
        const controls = {};

        function ErrorControls() {
            controls.setError = useSetAtom(notificationMessageState);
            return null;
        }

        const store = createStore();
        store.set(appConfigState, {});
        store.set(primaryColorState, '#005655');
        store.set(logoState, 'https://example.com/logo.png');

        render(
            <Provider store={store}>
                <ErrorControls />
                <SplashScreenContainer mapsindoorsSDKAvailable={true} />
            </Provider>
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
