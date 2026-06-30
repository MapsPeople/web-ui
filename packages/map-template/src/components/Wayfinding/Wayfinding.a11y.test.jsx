import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import Wayfinding from './Wayfinding';

expect.extend(toHaveNoViolations);

test('Wayfinding has no axe violations', async () => {
    const { container } = render(
        <RecoilRoot>
            <Wayfinding isOpen={false} />
        </RecoilRoot>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
