'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function ServiceCheckout({ productCode, title }: { productCode: string; title: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productCode }),
      })
      const order = await response.json()

      if (response.status === 401) {
        router.push('/login?next=/services')
        return
      }
      if (!response.ok) throw new Error(order.error || 'Unable to start payment')
      if (order.freeAccess) {
        router.push('/dashboard')
        return
      }

      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Could not load payment checkout'))
          document.body.appendChild(script)
        })
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Talenzo',
        description: title,
        handler: async (payment: Record<string, string>) => {
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment),
          })
          const result = await verifyResponse.json()
          if (!verifyResponse.ok) {
            setError(result.error || 'Payment verification failed')
            setIsLoading(false)
            return
          }
          router.push('/dashboard')
        },
        modal: { ondismiss: () => setIsLoading(false) },
      })
      checkout.open()
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start payment')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={isLoading}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {isLoading ? 'Opening checkout...' : 'Buy securely'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}
