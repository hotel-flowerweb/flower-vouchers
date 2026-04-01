/**
 * Generates unique voucher codes in format: HG-YYYY-XXXXX
 * Example: HG-2026-00421
 */
export function generateVoucherCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0');
  return `HG-${year}-${random}`;
}

/**
 * Generates a code and verifies uniqueness against the DB
 */
export async function generateUniqueCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  let code = generateVoucherCode();
  let attempts = 0;

  while (await checkExists(code)) {
    code = generateVoucherCode();
    attempts++;
    if (attempts > 20) {
      throw new Error('Could not generate a unique voucher code. Please try again.');
    }
  }

  return code;
}

export function formatCode(code: string): string {
  return code.toUpperCase().trim();
}
