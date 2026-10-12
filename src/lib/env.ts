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
  razorpayKeyId: () => required(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, "NEXT_PUBLIC_RAZORPAY_KEY_ID"),
  razorpayKeySecret: () => required(process.env.RAZORPAY_KEY_SECRET, "RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: () => required(process.env.RAZORPAY_WEBHOOK_SECRET, "RAZORPAY_WEBHOOK_SECRET"),
};
