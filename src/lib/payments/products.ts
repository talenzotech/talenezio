import { getService, isServiceCode, serviceProductCode, type ServiceCode } from '@/lib/services/catalog';
import { getTrainingByProductCode } from '@/lib/internships-training/data';

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

export function paidProductDetails(productCode: string): {
  amountPaise: number;
  currency: 'INR';
  serviceCode?: ServiceCode;
  category?: TestCategory;
  trainingCode?: string;
} | null {
  if (productCode.startsWith('pro-test:')) {
    const category = productCode.replace('pro-test:', '');
    return isTestCategory(category)
      ? { amountPaise: PRO_TEST_PRICE_PAISE, currency: PRO_TEST_CURRENCY, category }
      : null;
  }

  if (productCode.startsWith('training:')) {
    const training = getTrainingByProductCode(productCode);
    return training
      ? { amountPaise: training.pricePaise, currency: 'INR', trainingCode: training.id }
      : null;
  }

  if (!productCode.startsWith('service:')) return null;
  const serviceCode = productCode.replace('service:', '');
  if (!isServiceCode(serviceCode)) return null;
  const service = getService(serviceCode);
  return service?.paid && service.pricePaise !== null
    ? { amountPaise: service.pricePaise, currency: service.currency, serviceCode }
    : null;
}

export { serviceProductCode };
