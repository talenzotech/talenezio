import { createAdminClient } from '@/lib/supabase/admin'
import ReferralsClient, { type ReferralRow } from './ReferralsClient'

export const revalidate = 0

export default async function AdminReferralsPage() {
  const admin = createAdminClient()
  const { data: referrals } = await admin
    .from('referrals')
    .select('id, referrer_id, referred_user_id, code_submitted, status, created_at, verified_at, converted_at')
    .order('created_at', { ascending: false })

  const referralRows = referrals || []
  const profileIds = [...new Set(referralRows.flatMap((referral) => [referral.referrer_id, referral.referred_user_id]))]
  const [{ data: profiles }, { data: authUsers }] = await Promise.all([
    profileIds.length ? admin.from('profiles').select('id, full_name, referral_code').in('id', profileIds) : Promise.resolve({ data: [] }),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]))
  const emailMap = new Map((authUsers?.users || []).map((user) => [user.id, user.email || '']))

  const rows: ReferralRow[] = referralRows.map((referral) => ({
    ...referral,
    referrer_name: profileMap.get(referral.referrer_id)?.full_name || 'Unnamed user',
    referrer_email: emailMap.get(referral.referrer_id) || 'No email',
    referred_name: profileMap.get(referral.referred_user_id)?.full_name || 'Unnamed user',
    referred_email: emailMap.get(referral.referred_user_id) || 'No email',
  }))

  return <ReferralsClient rows={rows} />
}
