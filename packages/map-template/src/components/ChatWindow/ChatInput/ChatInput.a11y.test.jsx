import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ChatInput from './ChatInput';

expect.extend(toHaveNoViolations);

test('ChatInput has no axe violations', async () => {
    const { container } = render(
        <ChatInput
            onSendMessage={() => {}}
            isLoading={false}
            onClose={() => {}}
        />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
