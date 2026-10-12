import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { FREE_UNLOCK_PRODUCT_CODE, proTestProductCode, type TestCategory } from './products';

export async function hasProTestAccess(userId: string, category: TestCategory): Promise<boolean> {
  const admin = createAdminClient();
  const productCodes = [proTestProductCode(category), FREE_UNLOCK_PRODUCT_CODE];

  const [{ data: payment }, { data: entitlement }] = await Promise.all([
    admin
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .in('product_code', productCodes)
      .limit(1)
      .maybeSingle(),
    admin
      .from('entitlements')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('product_code', productCodes)
      .limit(1)
      .maybeSingle(),
  ]);

  if (payment) return true;
  if (!entitlement) return false;

  return !entitlement.expires_at || new Date(entitlement.expires_at).getTime() > Date.now();
}

export async function grantEntitlement(input: {
  userId: string;
  productCode: string;
  source: 'free_unlock' | 'payment' | 'admin';
  sourceId?: string;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from('entitlements').upsert(
    {
      user_id: input.userId,
      product_code: input.productCode,
      source: input.source,
      source_id: input.sourceId ?? null,
      status: 'active',
    },
    { onConflict: 'user_id,product_code,source' },
  );

  if (error) throw new Error(`Could not grant entitlement: ${error.message}`);
}
