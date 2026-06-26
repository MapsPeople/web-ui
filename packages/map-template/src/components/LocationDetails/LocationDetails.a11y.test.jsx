import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import LocationDetails from './LocationDetails';

jest.mock('../../hooks/useOutsideMapsIndoorsDataClick', () => () => false);
jest.mock('focus-trap-react', () => ({ FocusTrap: ({ children }) => children }));

expect.extend(toHaveNoViolations);

test('LocationDetails has no axe violations when no location is selected', async () => {
    const { container } = render(
        <RecoilRoot>
            <LocationDetails isOpen={false} />
        </RecoilRoot>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
