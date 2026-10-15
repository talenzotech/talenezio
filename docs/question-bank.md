# Google Sheets question bank

Create a spreadsheet with one worksheet named `questions`. Use this exact header row. Column order may change, but header names are case-insensitive and must not be renamed:

`id, category, section, question, option_a, option_b, option_c, option_d, correct_option, difficulty, is_active`

- `id`: a stable unique identifier for the question
- `category`: `AI`, `Technology`, `Finance`, or `Digital Marketing`
- `section`: `section-1`, `section-2`, or `section-3`
- `question`: the question text
- `option_a` through `option_d`: four non-empty answer options
- `correct_option`: `A`, `B`, `C`, or `D`
- `difficulty`: `easy`, `medium`, or `hard`
- `is_active`: `TRUE` only for questions available to users

Every non-empty data row must pass validation, including inactive rows. Invalid rows, duplicate IDs, and missing values prevent a test from starting rather than being silently skipped.

Free tests randomly select 20 active questions from the requested category. Pro tests randomly select 15 active questions from each section, for 45 questions total.

Grant Viewer access to the spreadsheet for the Google service-account email. Configure `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_WORKSHEET`, `GOOGLE_SHEETS_CLIENT_EMAIL`, and `GOOGLE_SHEETS_PRIVATE_KEY` in `.env.local` and Vercel environment settings only. Store the private key with escaped newlines (`\\n`) when required by the environment provider.
