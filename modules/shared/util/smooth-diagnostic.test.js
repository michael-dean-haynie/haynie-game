const SmoothDiagnostic = require('./smooth-diagnostic')

test('1 + 2 should equal 3', () => {
  const foo = new SmoothDiagnostic(0.9, 10)
  expect(1 + 2).toBe(3);
});
