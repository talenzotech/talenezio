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
