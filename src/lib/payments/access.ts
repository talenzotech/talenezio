import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { FREE_UNLOCK_PRODUCT_CODE, proTestProductCode, type TestCategory } from './products';

export async function hasProTestAccess(userId: string, category: TestCategory): Promise<boolean> {
  const admin = createAdminClient();
  const productCodes = [proTestProductCode(category), FREE_UNLOCK_PRODUCT_CODE];

  const [{ data: payment }, { data: entitlement }, { data: attempts }] = await Promise.all([
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
    admin
      .from('entitlements')
      .select('id, remaining_uses')
      .eq('user_id', userId)
      .eq('product_code', 'pro-test:attempts')
      .eq('status', 'active')
      .gt('remaining_uses', 0)
      .limit(1)
      .maybeSingle(),
  ]);

  if (payment || attempts) return true;
  if (!entitlement) return false;

  return !entitlement.expires_at || new Date(entitlement.expires_at).getTime() > Date.now();
}

export async function consumeTestAttempt(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: paidAccess } = await admin
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .like('product_code', 'pro-test:%')
    .limit(1)
    .maybeSingle();

  if (paidAccess) return true;
  const { data: freeAccess } = await admin
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_code', FREE_UNLOCK_PRODUCT_CODE)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  if (freeAccess) return true;

  const { data, error } = await admin.rpc('consume_test_attempt', { p_user_id: userId });
  if (error) throw new Error(`Could not consume test attempt: ${error.message}`);
  return Boolean(data);
}

export async function hasFreeUnlock(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_code', FREE_UNLOCK_PRODUCT_CODE)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

export async function grantEntitlement(input: {
  userId: string;
  productCode: string;
  source: 'free_unlock' | 'payment' | 'admin';
  sourceId?: string;
  remainingUses?: number;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from('entitlements').upsert(
    {
      user_id: input.userId,
      product_code: input.productCode,
      source: input.source,
      source_id: input.sourceId ?? null,
      status: 'active',
      remaining_uses: input.remainingUses ?? null,
    },
    { onConflict: 'user_id,product_code,source' },
  );

  if (error) throw new Error(`Could not grant entitlement: ${error.message}`);
}
