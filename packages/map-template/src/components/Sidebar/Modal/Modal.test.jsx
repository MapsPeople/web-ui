import { render } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import Modal from './Modal';

describe('Modal', () => {
    let observerCallback;
    let NativeMutationObserver;

    beforeEach(() => {
        NativeMutationObserver = global.MutationObserver;
        // Capture the callback Modal hands to the observer so we can deliver a
        // record at a moment of our choosing.
        global.MutationObserver = class {
            constructor(callback) {
                observerCallback = callback;
            }
            observe() {}
            disconnect() {}
        };
    });

    afterEach(() => {
        global.MutationObserver = NativeMutationObserver;
        observerCallback = undefined;
    });

    test('survives a mutation record delivered after unmount', () => {
        const { unmount } = render(
            <RecoilRoot>
                <Modal isOpen={true}><p>Content</p></Modal>
            </RecoilRoot>
        );

        unmount();

        // React detaches refs during the synchronous commit, but the effect
        // cleanup that disconnects the observer only runs in the later passive
        // flush. A record arriving in that window used to throw on a null ref.
        expect(() => observerCallback()).not.toThrow();
    });
});
