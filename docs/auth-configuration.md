# Supabase Auth Configuration

The application builds callback URLs from `NEXT_PUBLIC_APP_URL`.

Set this value in each environment:

```text
# Local
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://your-production-domain.example
```

## Supabase URL Configuration

In Supabase Dashboard, open **Authentication > URL Configuration**.

- Set **Site URL** to the production value of `NEXT_PUBLIC_APP_URL`.
- Add the production callback URL:

```text
https://your-production-domain.example/auth/callback
```

- Add the local callback URL for development:

```text
http://localhost:3000/auth/callback
```

Do not add arbitrary wildcard domains to the allowed redirect list.

## Email Authentication

In **Authentication > Providers > Email**:

- Enable email signups.
- Enable email confirmations for production.
- Configure the Resend SMTP provider described below instead of relying on Supabase's development email delivery.
- Ensure the confirmation email template preserves the Supabase confirmation URL parameters.

## Resend SMTP

The `RESEND_API_KEY` used by `src/utils/email.ts` sends application notification
emails. It does not automatically configure Supabase Auth email delivery. Auth
emails must be configured separately in the Supabase dashboard.

Before configuring SMTP:

1. Create or use a Resend account.
2. Verify the Talenezio sending domain in Resend.
3. Verify the sender address you will use in Resend. For the current setup,
   verify `Taleneziocontact@gmail.com` as a Resend sender.
4. For production deliverability, prefer a verified Talenezio domain sender
   such as `no-reply@talenezio.app` and configure its SPF and DKIM records.

In **Supabase > Authentication > Emails > SMTP Settings**, enable custom SMTP
and use these values:

```text
SMTP host: smtp.resend.com
SMTP port: 465
SMTP username: resend
SMTP password: <Resend API key>
Sender email: Taleneziocontact@gmail.com
Sender name: Talenezio Support
```

The SMTP password is a secret. Enter it in Supabase's secret configuration and
do not commit it to this repository or expose it through a `NEXT_PUBLIC_`
environment variable. The existing `RESEND_API_KEY` may be used as the SMTP
password, but Supabase stores and uses it independently after this setup.

After custom SMTP is enabled, review **Authentication > Rate Limits** and set
the email limit to match expected traffic. Supabase applies a low initial limit
to newly configured SMTP providers. Do not increase the limit until the domain
is verified and delivery has been tested.

## Auth Email Verification Checklist

Verify the complete flow in a staging or test environment before production:

1. Register with a new email address.
2. Confirm that the signup request redirects to the check-email/login message.
3. Confirm that Resend shows the message as delivered.
4. Open the confirmation link and verify it reaches `/auth/callback`.
5. Confirm that the callback redirects to the intended application destination.
6. Sign in with the confirmed account.
7. Request a password reset and verify that it is delivered through Resend.
8. Confirm that invalid or expired links show the expected error state.
9. Confirm that the Supabase Auth logs contain no SMTP, redirect, or template errors.

The application uses these callback flows:

- Email verification: `/auth/callback?flow=email_verification`
- Password recovery: `/auth/callback?flow=recovery`
- OAuth: `/auth/callback?flow=oauth`

The application appends a validated internal `next` destination to these URLs. External and protocol-relative destinations are rejected.

## Password Recovery

Password reset requests intentionally show the same success message whether or not the email is registered. This prevents account enumeration. Reset links establish a recovery session before `/reset-password` is rendered, and successful password updates always send the user to login before continuing to the validated destination.

## Application URL & Canonical OAuth Origin

OAuth callback URLs are constructed from a canonical, trusted application origin to prevent host header injection attacks.

In priority order:
1. Explicitly configured `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_SITE_URL`.
2. Trusted platform environment variables (e.g. `VERCEL_PROJECT_PRODUCTION_URL` or `VERCEL_URL` set by Vercel's orchestration infrastructure).
3. Local development fallback (`http://localhost:3000` when `NODE_ENV === 'development'`).

In production, if no canonical application URL is configured, the application fails safely rather than trusting arbitrary or unverified request headers.

## Google OAuth Configuration & Fixing "Error 401: deleted_client"

### Why `Error 401: deleted_client` happens
Google's authorization server returns `deleted_client` when the OAuth 2.0 Client ID entered in your Supabase Dashboard (**Authentication > Providers > Google**) has been deleted, disabled, or regenerated in the Google Cloud Console.

### Step-by-Step Fix for Google:
1. **Open Google Cloud Console**:
   Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. **Create New OAuth Client**:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Talenezio Web Client`.
3. **Set Authorized JavaScript Origins**:
   - `http://localhost:3000`
   - `https://your-production-domain.com` (and your Vercel deployment URL).
4. **Set Authorized Redirect URIs**:
   - Enter your Supabase callback URL:
     ```text
     https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
     ```
     *(Replace `<YOUR_SUPABASE_PROJECT_REF>` with your Supabase project ID, found in `NEXT_PUBLIC_SUPABASE_URL`)*.
5. **Update Supabase Dashboard**:
   - Open your Supabase project > **Authentication > Providers > Google**.
   - Toggle **Enable Sign in with Google** to ON.
   - Enter your new **Client ID** (ends with `.apps.googleusercontent.com`).
   - Enter your new **Client Secret**.
   - Click **Save**.

---

## LinkedIn OAuth Configuration & Feature Flag

### Why `Unsupported provider: provider is not enabled` happens
Supabase GoTrue returns HTTP 400 with `Unsupported provider: provider is not enabled` when a provider is invoked in the code (`linkedin_oidc` or `linkedin`) but is toggled **OFF** or unconfigured in the Supabase Dashboard under **Authentication > Providers > LinkedIn (OIDC)**.

### Conditional UI Availability Flag
To prevent user errors while LinkedIn Developer App product verification is finalized, LinkedIn login is conditionally displayed in the UI via the `NEXT_PUBLIC_ENABLE_LINKEDIN_AUTH` feature flag:
- When unset or `false`: The login and register pages render Google sign-in full-width.
- When `NEXT_PUBLIC_ENABLE_LINKEDIN_AUTH=true`: The UI immediately displays both Google and LinkedIn in a balanced 2-column grid without code changes.

### Step-by-Step Fix for LinkedIn:
1. **Open LinkedIn Developer Portal**:
   Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
2. **Select or Create App**:
   - Click on your app (or click **Create app**).
   - Enter your app details and associate your company LinkedIn page.
3. **Add Products**:
   - Navigate to the **Products** tab.
   - Add **"Sign In with LinkedIn using OpenID Connect"** (recommended) and request access.
4. **Set Authorized Redirect URLs**:
   - Go to the **Auth** tab.
   - Under **OAuth 2.0 settings > Authorized redirect URLs for your app**, click the plus icon and add:
     ```text
     https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
     ```
   - Copy your **Client ID** and **Primary Client Secret**.
5. **Enable in Supabase Dashboard**:
   - Open Supabase project > **Authentication > Providers > LinkedIn (OIDC)**.
   - Toggle **Enable LinkedIn (OIDC)** to **ON**.
   - Paste your LinkedIn **Client ID**.
   - Paste your LinkedIn **Client Secret**.
   - Click **Save**.
6. **URL Configuration in Supabase**:
   - Under **Authentication > URL Configuration > Redirect URLs**, ensure:
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com/auth/callback` (and preview URLs if testing previews).
7. **Activate Feature Flag**:
   - Set `NEXT_PUBLIC_ENABLE_LINKEDIN_AUTH=true` in your environment (e.g., Vercel) once Supabase provider configuration is active.


