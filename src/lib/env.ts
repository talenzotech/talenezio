function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  supabaseUrl: () => required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
  razorpayKeyId: () =>
    process.env.RAZORPAY_API_KEY ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    required(undefined, "RAZORPAY_API_KEY"),
  razorpayKeySecret: () =>
    process.env.RAZORPAY_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    required(undefined, "RAZORPAY_SECRET"),
  razorpayWebhookSecret: () => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || secret.trim() === '') {
      throw new Error("Missing required environment variable: RAZORPAY_WEBHOOK_SECRET");
    }
    return secret;
  },
};
