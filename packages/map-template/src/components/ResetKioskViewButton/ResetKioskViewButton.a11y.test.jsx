import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import ResetKioskViewButton from './ResetKioskViewButton';

jest.mock('../../hooks/useIsKioskContext', () => ({ useIsKioskContext: () => true }));

expect.extend(toHaveNoViolations);

test('ResetKioskViewButton has no axe violations', async () => {
    const portalTarget = document.createElement('div');
    portalTarget.className = 'reset-view-portal';
    document.body.appendChild(portalTarget);

    render(
        <RecoilRoot>
            <ResetKioskViewButton />
        </RecoilRoot>
    );

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();

    document.body.removeChild(portalTarget);
});
