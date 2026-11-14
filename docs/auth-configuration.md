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
- Configure production SMTP instead of relying on development email delivery.
- Ensure the confirmation email template preserves the Supabase confirmation URL parameters.

The application uses these callback flows:

- Email verification: `/auth/callback?flow=email_verification`
- Password recovery: `/auth/callback?flow=recovery`
- OAuth: `/auth/callback?flow=oauth`

The application appends a validated internal `next` destination to these URLs. External and protocol-relative destinations are rejected.

## Password Recovery

Password reset requests intentionally show the same success message whether or not the email is registered. This prevents account enumeration. Reset links establish a recovery session before `/reset-password` is rendered, and successful password updates always send the user to login before continuing to the validated destination.

## Google OAuth Configuration & Fixing "Error 401: deleted_client"

### Why `Error 401: deleted_client` happens
Google's authorization server returns `deleted_client` when the OAuth 2.0 Client ID entered in your Supabase Dashboard (**Authentication > Providers > Google**) has been deleted, disabled, or regenerated in the Google Cloud Console.

In your current setup, Supabase is attempting to use:
`client_id: 810802314537-9f5hr0qvppo5n4tg9101ual3btmv6jp9.apps.googleusercontent.com`
Google directly responds with:
`"Error 401: deleted_client - The OAuth client was deleted."`

### Step-by-Step Fix for Google:
1. **Open Google Cloud Console**:
   Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. **Create New OAuth Client**:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Talenezio Web Client`.
3. **Set Authorized JavaScript Origins**:
   - `http://localhost:3000`
   - `https://talenezio.com` (or your production domain).
4. **Set Authorized Redirect URIs**:
   - Enter your Supabase callback URL:
     ```text
     https://scypbnmgktnqyerfgrmi.supabase.co/auth/v1/callback
     ```
5. **Update Supabase Dashboard**:
   - Open your Supabase project (`scypbnmgktnqyerfgrmi`) > **Authentication > Providers > Google**.
   - Toggle **Enable Sign in with Google** to ON.
   - Enter your new **Client ID** (ends with `.apps.googleusercontent.com`).
   - Enter your new **Client Secret**.
   - Click **Save**.

---

## LinkedIn OAuth Configuration & Fixing "Unsupported provider: provider is not enabled"

### Why `Unsupported provider: provider is not enabled` happens
Supabase GoTrue returns HTTP 400 with `Unsupported provider: provider is not enabled` when a provider is invoked in the code (`linkedin_oidc` or `linkedin`) but is toggled **OFF** or unconfigured in the Supabase Dashboard under **Authentication > Providers > LinkedIn (OIDC)**.

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
     https://scypbnmgktnqyerfgrmi.supabase.co/auth/v1/callback
     ```
   - Copy your **Client ID** and **Primary Client Secret**.
5. **Enable in Supabase Dashboard**:
   - Open Supabase project (`scypbnmgktnqyerfgrmi`) > **Authentication > Providers > LinkedIn (OIDC)**.
   - Toggle **Enable LinkedIn (OIDC)** to **ON**.
   - Paste your LinkedIn **Client ID**.
   - Paste your LinkedIn **Client Secret**.
   - Click **Save**.
6. **URL Configuration in Supabase**:
   - Under **Authentication > URL Configuration > Redirect URLs**, ensure:
     - `http://localhost:3000/auth/callback`
     - `https://talenezio.com/auth/callback` (or your production URL).


