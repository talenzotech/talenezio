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
4. Set `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_WORKSHEET`, `GOOGLE_SHEETS_CLIENT_EMAIL`, and `GOOGLE_SHEETS_PRIVATE_KEY` in `.env.local` and the deployment environment.

## OAuth and deployment

OAuth provider setup, Vercel connection, and GoDaddy DNS are account-level tasks. They are ready to configure once you provide the project URLs; authentication code begins on Day 2.
