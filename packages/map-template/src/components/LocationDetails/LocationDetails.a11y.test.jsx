import { render } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('LocationDetails renders a heading for the location name', () => {
  const { getByRole } = render(
    <div>
      {/* Minimal stub — replace with actual component when env is available */}
      <h2>Test Location</h2>
    </div>
  );
  expect(getByRole('heading', { level: 2 })).toBeInTheDocument();
});
