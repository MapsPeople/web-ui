import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import LegendDialog from './LegendDialog';
import kioskLocationState from '../../atoms/kioskLocationState';

jest.mock('focus-trap-react', () => ({ FocusTrap: ({ children }) => children }));

expect.extend(toHaveNoViolations);

test('LegendDialog has no axe violations', async () => {
    const { container } = render(
        <RecoilRoot initializeState={(snap) => {
            snap.set(kioskLocationState, { properties: { fields: {} } });
        }}>
            <LegendDialog />
        </RecoilRoot>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
