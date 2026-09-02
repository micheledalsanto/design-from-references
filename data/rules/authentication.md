# Authentication and password fields

Measured rules, not remembered ones. Every number here names its source, because
this file exists after a design shipped "at least 12 characters" — a figure that
sounds plausible and appears in no standard.

Source: OWASP Authentication Cheat Sheet, read 2026-09-02.
https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

## Length

| Rule | Value | Source |
| --- | --- | --- |
| Minimum, MFA enabled | **8** characters | OWASP: "shorter than 8 characters are considered to be weak" |
| Minimum, no MFA | **15** characters | OWASP: "If MFA is not enabled passwords shorter than 15 characters are considered to be weak" |
| Maximum | **at least 64** | OWASP: "Maximum password length should be at least 64 characters to allow passphrases" |

**12 is not a number OWASP uses.** If a design states a minimum, it must state
which of the two cases it is in. A signup form with no MFA step says 15.

## Composition

OWASP is explicit that forced character variety is **wrong**:

> "There should be no password composition rules limiting the type of characters
> permitted. There should be no requirement for upper or lower case or numbers
> or special characters."

> "Allow usage of all characters including unicode and whitespace."

So: no "must contain a number and a symbol" checklist. Spaces are allowed and
worth saying out loud, because it tells the user a passphrase is welcome.

## What the field must and must not do

- **Never render the password in clear text** in a mock. A design that shows
  `hunter2` in the input teaches the wrong thing and leaks in a screenshot.
  Use a masked value.
- **Never state the measured length of what was typed.** "Your password is 7
  characters, add 5 more" reads as helpful and tells anyone looking at the
  screen how long the secret is. State the rule instead: "Use at least 15
  characters."
- **State the rule before the error fires**, in help text under the label. An
  error that repeats a rule the user was never shown is a design failure, not a
  user failure.
- **Offer a strength meter** rather than a rules checklist (OWASP recommends
  zxcvbn-ts) and **block known-breached passwords** (Pwned Passwords).

## Error messages

- **Login failure must not reveal whether the account exists.** OWASP's wording:
  "Login failed; Invalid user ID or password."
- **Signup must not reveal whether an email is already registered.** Show "A
  link to activate your account has been emailed to the address provided."
  either way.

This one matters for design because the obvious, friendly microcopy — "no
account with that email" — is a user enumeration vulnerability. The accessible
choice and the secure choice disagree here, and security wins.

## How to use this file

Read it at gate 3 whenever a design contains a password, login, or signup
field, the same way the dataset is read for aesthetics. If a design contradicts
a rule here, it goes in the constraints file's Deviations table with a reason,
or it does not ship.
