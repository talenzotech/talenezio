# Referral Tracking

## Current scope

- Every profile receives a reusable code such as `TZ-7K4M2Q`.
- Email/password signup accepts a code and records the referrer when the code is valid.
- Invalid codes do not block signup and do not create a referral relationship.
- A referred user can have only one referrer; a referrer's code can be used by multiple users.
- Users can view and copy their code from the dashboard.
- Admins can view referrer and referred-user names, email addresses, code, signup date, and status at `/admin/referrals`.
- Referral status progresses from `registered` to `verified` or `converted`.

## Future scope

- Referral attribution through Google and LinkedIn OAuth signup.
- Reward, commission, payout, and incentive calculations.

The database relationship is intentionally independent from those future features so they can be added without changing existing referral history.
