import UnlockProgramClient from './UnlockProgramClient'
import type { UnlockFeature } from './actions'
import FeatureBottomNav from '@/components/FeatureBottomNav'

type PageProps = {
  searchParams: Promise<{ feature?: string | string[]; request?: string | string[] }>
}

export default async function UnlockProgramPage({ searchParams }: PageProps) {
  const params = await searchParams
  const featureValue = Array.isArray(params.feature) ? params.feature[0] : params.feature
  const feature: UnlockFeature = featureValue === 'linkedin_optimization'
    ? 'linkedin_optimization'
    : 'skill_test_pro'
  const requestValue = Array.isArray(params.request) ? params.request[0] : params.request
  return (
    <>
      <div className="pb-20">
        <UnlockProgramClient
          initialFeature={feature}
          showRequestForm={requestValue === '1'}
        />
      </div>
      <FeatureBottomNav />
    </>
  )
}
