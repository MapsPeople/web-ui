import { render, screen } from '@testing-library/react';
import ChatLoadingFallback from './ChatLoadingFallback';
import initI18n from '../../i18n/initialize.js';

// The fallback renders inside a Suspense fallback, and i18n is initialized late (in a
// MapTemplate effect), so it must survive rendering before i18n exists.
describe('ChatLoadingFallback', () => {
    test('renders the untranslated key without suspending when i18n is not yet initialized', () => {
        render(<ChatLoadingFallback />);

        expect(screen.getByRole('status')).toHaveTextContent('Loading chat');
    });

    test('renders the translated label once i18n is initialized', () => {
        initI18n('da');

        render(<ChatLoadingFallback />);

        expect(screen.getByRole('status')).toHaveTextContent('Indlæser chatten');
    });
});
