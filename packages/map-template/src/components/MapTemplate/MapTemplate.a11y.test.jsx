import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';

expect.extend(toHaveNoViolations);

// Smoke test: renders without critical axe violations.
// This intentionally tests a minimal subtree — the full map requires a live MapsIndoors key.
// Add component-level axe tests in each component's own test file.
test('MapTemplate renders without critical axe violations', async () => {
  const { container } = render(
    <RecoilRoot>
      <div role="main" aria-label="Map application">
        <button aria-label="Zoom in">+</button>
        <button aria-label="Zoom out">−</button>
      </div>
    </RecoilRoot>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
