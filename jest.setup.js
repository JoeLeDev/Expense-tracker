jest.mock('./src/hooks/notify', () => ({
  notify: jest.fn(),
  toaster: { create: jest.fn() }
}));

beforeAll(() => {
  window.alert = jest.fn();
  window.confirm = jest.fn();
}); 