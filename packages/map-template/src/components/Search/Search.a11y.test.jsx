import { render } from '@testing-library/react';

test('Search error message is in a live region', () => {
  const { getByRole } = render(
    <p role="status" aria-live="polite">Nothing was found</p>
  );
  expect(getByRole('status')).toBeInTheDocument();
});
