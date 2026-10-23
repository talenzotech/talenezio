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

## Local Demo Login

When running with `npm run dev`, the login page provides a local-only demo account:

```text
Email: demo@talenezio.local
Password: Demo123!
```

This demo session is stored in an HTTP-only cookie and is only accepted in the development environment. It opens the dashboard without requiring Supabase configuration; account-backed features still require a configured Supabase project. Do not use these demo credentials in production.

## Password Recovery

Password reset requests intentionally show the same success message whether or not the email is registered. This prevents account enumeration. Reset links establish a recovery session before `/reset-password` is rendered, and successful password updates always send the user to login before continuing to the validated destination.
