import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Contains render errors from a subtree so that one failing part of the Map Template
 * cannot unmount the whole widget.
 *
 * The case this exists for is a lazily loaded chunk that is no longer on the server -
 * typically a tab that was opened before a redeploy. React.lazy throws when the import
 * rejects, and without a boundary that error propagates all the way to the root.
 */
// Wording differs per bundler and per browser, hence matching several phrasings.
const CHUNK_ERROR_PATTERN = /loading chunk|dynamically imported module|importing a module script failed|error loading script/i;

class ErrorBoundary extends Component {

    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const isChunkError = CHUNK_ERROR_PATTERN.test(error?.message ?? '');

        // Grouped rather than a single line, because the interesting part of a chunk failure
        // is the context around it: which bundle, whether the browser is even online, and
        // where in the tree it happened.
        console.error(`MapsIndoors: ${this.props.name ?? 'A component'} failed to render.`, {
            cause: isChunkError
                ? 'A lazily loaded bundle could not be fetched. Usually the page has been open across a deploy, so the bundle it asks for is no longer on the server, and reloading picks up the current one. Being offline or behind a blocking proxy causes the same thing.'
                : 'The component threw while rendering, so this is not a bundle problem. Reloading will most likely hit the same error.',
            online: window.navigator.onLine,
            componentStack: errorInfo?.componentStack,
            // The bundler puts the URL of the bundle it could not fetch in the message.
            error
        });
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? null;
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node,
    /** Rendered instead of the children once an error is caught. Nothing by default. */
    fallback: PropTypes.node,
    /** Used to identify the failing subtree in the console. */
    name: PropTypes.string
};

export default ErrorBoundary;
