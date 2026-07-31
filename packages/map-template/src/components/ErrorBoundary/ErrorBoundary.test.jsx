import { lazy, Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Exploding() {
    throw new Error('Loading chunk 42 failed.');
}

describe('ErrorBoundary', () => {
    let consoleError;

    beforeEach(() => {
        // React logs caught errors on its own, which would just be noise here.
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => consoleError.mockRestore());

    test('renders its children while nothing throws', () => {
        render(<ErrorBoundary><p>Chat</p></ErrorBoundary>);

        expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    test('renders the fallback instead of unmounting when a child throws', () => {
        render(
            <div>
                <p>The map</p>
                <ErrorBoundary fallback={<p>Chat could not be loaded</p>}>
                    <Exploding />
                </ErrorBoundary>
            </div>
        );

        expect(screen.getByText('Chat could not be loaded')).toBeInTheDocument();
        // The point of the boundary: the surrounding UI survives.
        expect(screen.getByText('The map')).toBeInTheDocument();
    });

    test('catches a lazy chunk that fails to load, keeping the rest of the UI mounted', async () => {
        const StaleChunk = lazy(() => Promise.reject(new Error('Loading chunk 42 failed.')));

        render(
            <div>
                <p>The map</p>
                <ErrorBoundary fallback={<p>Chat could not be loaded</p>}>
                    <Suspense fallback={<p>Loading chat</p>}>
                        <StaleChunk />
                    </Suspense>
                </ErrorBoundary>
            </div>
        );

        await waitFor(() => expect(screen.getByText('Chat could not be loaded')).toBeInTheDocument());
        expect(screen.getByText('The map')).toBeInTheDocument();
    });

    test('logs the failing subtree, a chunk-specific cause and the component stack', () => {
        render(<ErrorBoundary name="Mapbox view"><Exploding /></ErrorBoundary>);

        const [message, details] = consoleError.mock.calls.find(([first]) =>
            typeof first === 'string' && first.includes('Mapbox view'));

        expect(message).toContain('MapsIndoors: Mapbox view failed to render.');
        expect(details.cause).toContain('lazily loaded bundle could not be fetched');
        expect(details.componentStack).toContain('Exploding');
        expect(details).toHaveProperty('online');
    });

    test('says a render error is not a bundle problem, so reloading will not help', () => {
        function Broken() {
            throw new TypeError('Cannot read properties of undefined (reading "venue")');
        }

        render(<ErrorBoundary name="Chat"><Broken /></ErrorBoundary>);

        const [, details] = consoleError.mock.calls.find(([first]) =>
            typeof first === 'string' && first.includes('Chat'));

        expect(details.cause).toContain('not a bundle problem');
    });

    test('renders nothing when no fallback is given', () => {
        const { container } = render(<ErrorBoundary><Exploding /></ErrorBoundary>);

        expect(container).toBeEmptyDOMElement();
    });
});
