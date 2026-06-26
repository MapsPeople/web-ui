import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import Search from './Search';

jest.mock('../../providers/GeminiProvider', () => ({ useGemini: () => ({ isGeminiEnabled: false }) }));
jest.mock('../../hooks/useInitialChatMessage', () => ({ useInitialChatMessage: () => '' }));

expect.extend(toHaveNoViolations);

test('Search has no axe violations in empty state', async () => {
    const { container } = render(
        <RecoilRoot>
            <Search isOpen={false} />
        </RecoilRoot>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
