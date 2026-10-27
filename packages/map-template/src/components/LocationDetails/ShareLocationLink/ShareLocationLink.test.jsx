import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import ShareLocationLink from './ShareLocationLink';
import supportsUrlParametersState from '../../../atoms/supportsUrlParametersState';
import notificationMessageState from '../../../atoms/notificationMessageState';
import apiKeyState from '../../../atoms/apiKeyState';
import initI18n from '../../../i18n/initialize.js';

jest.mock('../../../assets/chain-link.svg?react', () => () => null, {
    virtual: true
});
jest.mock('../../../assets/qrcode.svg?react', () => () => null, {
    virtual: true
});
jest.mock('../../../assets/share.svg?react', () => () => null, {
    virtual: true
});
jest.mock('../../../hooks/useIsDesktop', () => ({ useIsDesktop: () => true }));

function NotificationProbe() {
    const notificationMessage = useRecoilValue(notificationMessageState);
    return (
        <output data-testid="notification">
            {JSON.stringify(notificationMessage)}
        </output>
    );
}

function renderShareLocationLink() {
    return render(
        <RecoilRoot
            initializeState={({ set }) => {
                set(supportsUrlParametersState, true);
                set(apiKeyState, 'test-key');
            }}
        >
            <ShareLocationLink location={{ id: 'location-1' }} />
            <NotificationProbe />
        </RecoilRoot>
    );
}

function clickCopyLink() {
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
}

describe('ShareLocationLink', () => {
    const originalClipboard = navigator.clipboard;
    const writeText = jest.fn();

    beforeAll(() => {
        initI18n('en');
    });

    beforeEach(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText },
            configurable: true
        });
    });

    afterEach(() => {
        writeText.mockReset();
        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            configurable: true
        });
    });

    test('shows a success notification and closes the dropdown when the link is copied', async () => {
        writeText.mockResolvedValue();
        renderShareLocationLink();

        clickCopyLink();

        await waitFor(() =>
            expect(screen.getByTestId('notification')).toHaveTextContent(
                JSON.stringify({ text: 'Link copied', type: 'success', sticky: false })
            )
        );
        expect(writeText).toHaveBeenCalledWith(
            `${window.location.origin}?apiKey=test-key&primaryColor=005655&searchExternalLocations=true&locationId=location-1`
        );
        expect(
            screen.queryByRole('button', { name: 'Copy link' })
        ).not.toBeInTheDocument();
    });

    test('shows an error notification and closes the dropdown when copying the link fails', async () => {
        writeText.mockRejectedValue(new Error('denied'));
        renderShareLocationLink();

        clickCopyLink();

        await waitFor(() =>
            expect(screen.getByTestId('notification')).toHaveTextContent(
                JSON.stringify({
                    text: 'Could not copy link',
                    type: 'error',
                    sticky: false
                })
            )
        );
        expect(
            screen.queryByRole('button', { name: 'Copy link' })
        ).not.toBeInTheDocument();
    });
});
