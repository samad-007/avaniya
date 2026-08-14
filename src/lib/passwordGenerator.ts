import crypto from "crypto";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No I, O
const LOWER = "abcdefghijkmnpqrstuvwxyz"; // No l, o
const NUMS = "23456789"; // No 0, 1
const SYMBOLS = "!@#$%&*+=-_?"; // Clean, non-ambiguous symbols

/**
 * Generate a strict 15-character cryptographically secure password
 * with balanced upper, lower, numbers, and symbols while avoiding ambiguous chars.
 */
export function generateSecurePassword(length: number = 15): string {
  if (length < 12) length = 15;

  // Pick at least 2 of each category to guarantee strength
  const chars: string[] = [];

  const getRandomChar = (set: string): string => {
    const randomByte = crypto.randomBytes(1)[0];
    return set[randomByte % set.length];
  };

  // 2 Upper, 2 Lower, 2 Numbers, 2 Symbols = 8 chars
  for (let i = 0; i < 2; i++) chars.push(getRandomChar(UPPER));
  for (let i = 0; i < 2; i++) chars.push(getRandomChar(LOWER));
  for (let i = 0; i < 2; i++) chars.push(getRandomChar(NUMS));
  for (let i = 0; i < 2; i++) chars.push(getRandomChar(SYMBOLS));

  // Fill remaining characters from combined non-ambiguous pool
  const allPool = UPPER + LOWER + NUMS + SYMBOLS;
  while (chars.length < length) {
    chars.push(getRandomChar(allPool));
  }

  // Fisher-Yates shuffle using cryptographically secure random values
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
