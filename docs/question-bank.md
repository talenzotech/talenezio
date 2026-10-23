# Google Sheets question bank

Create one Google spreadsheet with two worksheets:

- `Free`
- `Paid`

Both worksheets use this exact header row. Column order may change, but header names are case-insensitive and must not be renamed:

`id, category, section, question, option_a, option_b, option_c, option_d, correct_option, difficulty, is_active`

Each non-empty row must contain:

- `id`: a stable unique identifier for the question
- `category`: `AI`, `Technology`, `Software Engineering`, `Finance`, or `Digital Marketing`
- `section`: a section label such as `section-1` or `section-2`
- `question`: the question text
- `option_a` through `option_d`: four non-empty answer options
- `correct_option`: `A`, `B`, `C`, or `D`
- `difficulty`: `easy`, `medium`, `hard`, or blank while the MVP bank is being completed
- `is_active`: `TRUE`, `FALSE`, `1`, or `0`

`Software Engineering` is mapped to the application's `technology` category.

The `Free` worksheet supplies Free tests. The application selects 20 questions per category. While the MVP bank is incomplete, a category with fewer than 20 questions is temporarily filled by repeating a question with a unique attempt ID.

The `Paid` worksheet supplies Pro tests. The application selects 45 questions per category. Paid questions do not need to be split into three sections for the MVP.

Share the spreadsheet with the Google service-account email as Viewer. Configure these server-only variables in `.env.local` and deployment settings:

```text
GOOGLE_SHEETS_ID=...
GOOGLE_SHEETS_FREE_WORKSHEET=Free
GOOGLE_SHEETS_PAID_WORKSHEET=Paid
GOOGLE_SHEETS_CLIENT_EMAIL=...
GOOGLE_SHEETS_PRIVATE_KEY=...
```

Store private-key escaped newlines (`\\n`) when required by the environment provider.
