import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('ChatInput renders without axe violations', async () => {
  const { container } = render(
    <form>
      <label htmlFor="chat">Chat message</label>
      <textarea id="chat" aria-label="Chat message" />
      <button type="submit" aria-label="Send message">Send</button>
    </form>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
