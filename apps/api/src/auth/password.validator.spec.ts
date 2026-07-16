import { isStrongPassword } from './password.validator';

describe('isStrongPassword', () => {
  it('accepts passwords meeting minimum strength', () => {
    expect(isStrongPassword('User123!')).toBe(true);
    expect(isStrongPassword('Admin123!')).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(isStrongPassword('Ab1!')).toBe(false);
  });

  it('rejects passwords without uppercase letter', () => {
    expect(isStrongPassword('user123!')).toBe(false);
  });

  it('rejects passwords without lowercase letter', () => {
    expect(isStrongPassword('USER123!')).toBe(false);
  });

  it('rejects passwords without digit', () => {
    expect(isStrongPassword('UserTest!')).toBe(false);
  });

  it('rejects passwords without special character', () => {
    expect(isStrongPassword('User1234')).toBe(false);
  });
});
