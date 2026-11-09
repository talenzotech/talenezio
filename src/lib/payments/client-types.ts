export type PaymentOrderResponse = {
  error?: string;
  freeAccess?: boolean;
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
};

export type PaymentApiResponse = {
  error?: string;
};

export type RazorpayPaymentFailure = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    metadata?: { order_id?: string };
  };
};

export type RazorpayCheckout = {
  open: () => void;
  on?: (event: 'payment.failed', callback: (response: RazorpayPaymentFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}
