import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RecoilRoot } from 'recoil';
import QRCodeDialog from './QRCodeDialog';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock')
}));

jest.mock('focus-trap-react', () => ({
  FocusTrap: ({ children }) => children
}));

expect.extend(toHaveNoViolations);

test('QRCodeDialog has no axe violations', async () => {
  const { container } = render(
    <RecoilRoot>
      <QRCodeDialog isOpen={true} onClose={() => {}} />
    </RecoilRoot>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
