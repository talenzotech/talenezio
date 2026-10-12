import 'server-only';

import crypto from 'node:crypto';
import { env } from '@/lib/env';

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
};

function razorpayAuthHeader(): string {
  return `Basic ${Buffer.from(`${env.razorpayKeyId()}:${env.razorpayKeySecret()}`).toString('base64')}`;
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: razorpayAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Razorpay order creation failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<RazorpayOrder>;
}

export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret())
    .update(`${input.orderId}|${input.paymentId}`)
    .digest('hex');

  return input.signature.length === expected.length && crypto.timingSafeEqual(
    Buffer.from(input.signature),
    Buffer.from(expected),
  );
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', env.razorpayWebhookSecret())
    .update(body)
    .digest('hex');

  return signature.length === expected.length && crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}
