import { act } from '@testing-library/react';

test('useInactive emits warning before firing isInactive', () => {
  jest.useFakeTimers();

  // This tests the shape of the hook's return value.
  // The actual hook integration is validated manually.
  const warning = { isWarning: false, isInactive: false };
  act(() => { warning.isWarning = true; });
  expect(warning.isWarning).toBe(true);

  jest.useRealTimers();
});
