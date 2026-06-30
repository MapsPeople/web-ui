import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import ChatButton from './ChatButton';
import chatHistoryState from '../../atoms/chatHistoryState';

expect.extend(toHaveNoViolations);

test('ChatButton has no axe violations', async () => {
    const portalTarget = document.createElement('div');
    portalTarget.className = 'chat-button-portal';
    document.body.appendChild(portalTarget);

    render(
        <RecoilRoot initializeState={(snap) => {
            snap.set(chatHistoryState, [{ role: 'user', content: 'Hello' }]);
        }}>
            <ChatButton
                pushAppView={() => {}}
                currentAppView="SEARCH"
                appViews={{ CHAT: 'CHAT' }}
            />
        </RecoilRoot>
    );

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();

    document.body.removeChild(portalTarget);
});
