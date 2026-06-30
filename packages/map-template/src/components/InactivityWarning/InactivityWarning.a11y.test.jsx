import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { InactivityWarning } from './InactivityWarning';

jest.mock('focus-trap-react', () => ({ FocusTrap: ({ children }) => children }));

expect.extend(toHaveNoViolations);

test('InactivityWarning has no axe violations', async () => {
    const { container } = render(<InactivityWarning />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
