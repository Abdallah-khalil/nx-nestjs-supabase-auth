export interface ConfigProps {
  supabaseKey?: string;
  supabaseServiceKey?: string;
  supabaseUrl?: string;
  supabaseJwtSecret?: string;
  stripeApiKey?: string;
  stripeWebhookAccountSecret?: string;
  stripeWebhookAccountTestSecret?: string;
}

export const config: () => ConfigProps = (): ConfigProps => ({
  supabaseJwtSecret: process.env.JWT_SECRET,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  stripeApiKey: process.env.STRIPE_API_KEY,
  stripeWebhookAccountSecret: process.env.STRIPE_WEBHOOK_ACCOUNT_SECRET,
  stripeWebhookAccountTestSecret:
    process.env.STRIPE_WEBHOOK_ACCOUNT_TEST_SECRET,
});
