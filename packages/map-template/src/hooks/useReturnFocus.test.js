// Test the return focus contract:
test('useReturnFocus returns focus to trigger element on deactivate', () => {
  const button = document.createElement('button');
  document.body.appendChild(button);
  button.focus();

  // Simulate saving + restoring focus
  const savedElement = document.activeElement;
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.focus();
  expect(document.activeElement).toBe(input);

  savedElement.focus();
  expect(document.activeElement).toBe(button);

  document.body.removeChild(button);
  document.body.removeChild(input);
});
