export const PRO_TEST_PRICE_PAISE = 3200;
export const PRO_TEST_CURRENCY = 'INR';

export const TEST_CATEGORIES = ['ai', 'technology', 'finance', 'digital-marketing'] as const;
export type TestCategory = (typeof TEST_CATEGORIES)[number];

export function isTestCategory(value: string): value is TestCategory {
  return TEST_CATEGORIES.includes(value as TestCategory);
}

export function proTestProductCode(category: TestCategory): string {
  return `pro-test:${category}`;
}

export const FREE_UNLOCK_PRODUCT_CODE = 'pro-test:all';
