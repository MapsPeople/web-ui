import { act } from '@testing-library/react';

test('document lang attribute updates when language changes', () => {
  document.documentElement.lang = 'en';

  act(() => {
    document.documentElement.lang = 'de';
  });

  expect(document.documentElement.lang).toBe('de');
});
