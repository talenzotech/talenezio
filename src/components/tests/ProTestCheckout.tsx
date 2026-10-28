'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

type Props = { category: string }

export default function ProTestCheckout({ category }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRazorpay = async () => {
    if (window.Razorpay) return

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Could not load payment checkout'))
      document.body.appendChild(script)
    })
  }

  const startCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const orderResponse = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })
      const order = await orderResponse.json()

      if (orderResponse.status === 401) {
        router.push(`/login?next=/tests/${category}?type=pro`)
        return
      }
      if (!orderResponse.ok) throw new Error(order.error || 'Unable to start payment')
      if (order.freeAccess) {
        router.push(`/tests/${category}?type=pro`)
        return
      }

      await loadRazorpay()

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Talenezio',
        description: `Pro ${category} assessment`,
        handler: async (response: Record<string, string>) => {
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          const result = await verifyResponse.json()
          if (!verifyResponse.ok) {
            setError(result.error || 'Payment verification failed')
            setIsLoading(false)
            return
          }
          router.push(`/tests/${category}?type=pro`)
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
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
        className="block text-center w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
      >
        {isLoading ? 'Opening checkout...' : 'Unlock Pro Test'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}
