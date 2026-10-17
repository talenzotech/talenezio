import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { proTestProductCode, type TestCategory } from './products';
import type { ServiceCode } from '@/lib/services/catalog';

export async function hasProTestAccess(userId: string, category: TestCategory): Promise<boolean> {
  const admin = createAdminClient();
  const productCodes = [proTestProductCode(category)];

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
      .select('id, remaining_uses, expires_at')
      .eq('user_id', userId)
      .eq('product_code', 'pro-test:attempts')
      .eq('status', 'active')
      .gt('remaining_uses', 0)
      .limit(10),
  ]);

  if (payment) return true;
  if (attempts?.some((attempt) => !attempt.expires_at || new Date(attempt.expires_at).getTime() > Date.now())) return true;
  if (!entitlement) return false;

  return !entitlement.expires_at || new Date(entitlement.expires_at).getTime() > Date.now();
}

export async function consumeTestAttempt(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: paidAccess } = await admin
    .from('payments')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .like('product_code', 'pro-test:%')
    .limit(1)
    .maybeSingle();

  if (paidAccess) return true;
  const { data, error } = await admin.rpc('consume_test_attempt', { p_user_id: userId });
  if (error) throw new Error(`Could not consume test attempt: ${error.message}`);
  return Boolean(data);
}

export async function hasServiceAccess(userId: string, serviceCode: ServiceCode): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('entitlements')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('product_code', `service:${serviceCode}`)
    .eq('source', 'free_unlock')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  return Boolean(data && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now()));
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
