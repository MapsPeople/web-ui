import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import Accessibility from './Accessibility';

expect.extend(toHaveNoViolations);

test('Accessibility has no axe violations', async () => {
    const { container } = render(
        <RecoilRoot>
            <Accessibility />
        </RecoilRoot>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
