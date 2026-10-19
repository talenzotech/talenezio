import FeatureBottomNav from '@/components/FeatureBottomNav'

export default function TestsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-20">{children}</div>
      <FeatureBottomNav />
    </>
  )
}
