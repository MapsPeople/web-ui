import { render } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Accessibility component checkboxes all have associated labels', () => {
  const { getAllByRole } = render(
    <form>
      <label>
        <input type="checkbox" />
        Avoid stairs and escalators
      </label>
    </form>
  );
  const checkboxes = getAllByRole('checkbox');
  checkboxes.forEach(cb => {
    expect(cb).toHaveAccessibleName();
  });
});
