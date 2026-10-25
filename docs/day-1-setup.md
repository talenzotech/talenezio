# Day 1 external setup

## Supabase

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/migrations/202607240001_initial_schema.sql`.
3. Add the project URL, anon key, and service-role key to `.env.local` using `.env.example`.
4. Set the Auth Site URL to `http://localhost:3000` for now.

## Google Sheets

1. Create the spreadsheet described in `docs/question-bank.md`.
2. Create a Google Cloud service account and enable Google Sheets API.
3. Share the spreadsheet with that service-account email as a Viewer.
4. Set these server-only variables in `.env.local` and the deployment environment:

   ```text
   GOOGLE_SHEETS_ID=...
   GOOGLE_SHEETS_FREE_WORKSHEET=Free
   GOOGLE_SHEETS_PAID_WORKSHEET=Paid
   GOOGLE_SHEETS_CLIENT_EMAIL=...
   GOOGLE_SHEETS_PRIVATE_KEY=...
   ```

   `GOOGLE_SHEET_ID` is not used; use the plural `GOOGLE_SHEETS_ID` name.
   `GOOGLE_PROJECT_ID` is optional metadata and is not required by the current
   Sheets client. Never prefix these variables with `NEXT_PUBLIC_`.
5. Store the private key only in the local/deployment secret store. If the key
   is provided as a single line, preserve its escaped `\n` newline sequences.

## OAuth and deployment

OAuth provider setup, Vercel connection, and GoDaddy DNS are account-level tasks. They are ready to configure once you provide the project URLs; authentication code begins on Day 2.
