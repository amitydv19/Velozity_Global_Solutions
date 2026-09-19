import { describe, expect, it } from 'vitest';
import { comparePassword, generateRefreshToken, hashPassword, hashToken } from './hash.js';

describe('hash utils', () => {
  it('hashes and compares passwords correctly', async () => {
    const plain = 'SecretPassword123!';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);

    const matches = await comparePassword(plain, hash);
    expect(matches).toBe(true);

    const wrong = await comparePassword('WrongPassword', hash);
    expect(wrong).toBe(false);
  });

  it('hashes tokens deterministically with sha256', () => {
    const token = 'test-token-123';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('generates a secure random refresh token', () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();
    expect(token1).toHaveLength(128); // 64 bytes in hex
    expect(token2).toHaveLength(128);
    expect(token1).not.toBe(token2);
  });
});
