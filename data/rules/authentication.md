# Authentication and password fields

Measured rules, not remembered ones. Every number here names its source, because
this file exists after a design shipped "at least 12 characters" — a figure that
sounds plausible and appears in no standard.

Sources, both read 2026-09-02:
- OWASP Authentication Cheat Sheet —
  https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **NIST SP 800-63B-4** (Revision 4, final July 2025) — the current one —
  https://pages.nist.gov/800-63-4/sp800-63b/authenticators/
  PDF: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63B-4.pdf

Re-verified 2026-09-02 after the rule was questioned as implausible. The check
found a real error: the first draft cited **Revision 3**, which Revision 4
superseded. Rev 4 does not soften the rule, it hardens it — see below.

## Length

| Rule | Value | Source |
| --- | --- | --- |
| Minimum, password is the only factor | **15** characters, **SHALL** | NIST 800-63B-4 §3.1.1.2: "SHALL require passwords that are used as a single-factor authentication mechanism to be a minimum of 15 characters in length" |
| Minimum, part of MFA | **8** characters, **SHALL** | NIST: "MAY allow passwords that are only used as part of multi-factor authentication processes to be shorter but SHALL require them to be a minimum of eight characters" |
| Maximum | **at least 64**, SHOULD | NIST: "SHOULD permit a maximum password length of at least 64 characters" |

The two standards agree on the numbers. NIST states them as conformance
requirements; OWASP frames the same thresholds as what counts as weak.

**12 is not a number OWASP uses.** If a design states a minimum, it must state
which of the two cases it is in. A signup form with no MFA step says 15.

## Composition

OWASP is explicit that forced character variety is **wrong**:

> "There should be no password composition rules limiting the type of characters
> permitted. There should be no requirement for upper or lower case or numbers
> or special characters."

> "Allow usage of all characters including unicode and whitespace."

NIST SP 800-63B agrees and is more specific: verifiers SHOULD accept all
printing ASCII characters **and the space character**, MAY collapse runs of
consecutive spaces before verifying, and SHOULD accept Unicode.

So: no "must contain a number and a symbol" checklist, and the field must
accept spaces.

### No special characters, no uppercase, no digits: this is deliberate

This is the rule most likely to be overridden by whoever reviews the design,
because it contradicts twenty years of habit. The verbatim wording, NIST SP
800-63B section 5.1.1.2:

**Revision 4, section 3.1.1.2 — the binding one:**

> "Verifiers and CSPs **SHALL NOT** impose other composition rules (e.g.,
> requiring mixtures of different character types) for passwords."

> "Verifiers and CSPs **SHALL NOT** require subscribers to change passwords
> periodically. However, verifiers SHALL force a change if there is evidence
> that the authenticator has been compromised."

Revision 3 said SHOULD NOT; Revision 4 says **SHALL NOT**. In NIST's own
terminology that is the difference between a recommendation and a requirement:
the rule was strengthened, not relaxed.

**Why the checklist makes passwords worse.** `Password1!` satisfies every
composition rule ever written and is among the first guesses in any attack.
`four blue horses stapled` satisfies none of them and is far stronger. Forcing
character variety does not produce random passwords, it produces *predictable*
ones: capital at the front, digit and an exclamation mark at the end. The rule
is not a relaxation of security, it is the finding that the checklist was
security theatre.

What replaces it, per both standards: **length**, a **strength meter**
(OWASP names zxcvbn-ts), and a **check against breached password lists**. On a
breach hit, NIST is prescriptive — the verifier SHALL say the secret was
rejected, SHALL give the reason, and SHALL require a different one.

So a design must **not** show a "must contain 1 uppercase, 1 number, 1 symbol"
checklist under the field. If a stakeholder asks for one, this section is the
answer, with the citation.

**But accepting spaces is a build requirement, not copy.** An earlier draft of
this file said the allowance was "worth saying out loud". It is not: no real
product writes "spaces are allowed" under a password field, and a user who
reads it wonders why it needed saying. State the length and stop. The space
rule belongs in the handoff notes to whoever implements the field.

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
- **Help text says the length and nothing else.** "At least 15 characters." is
  the whole of it. Not the composition rules (there are none), not the space
  allowance (an implementation detail), and not writing advice like "a short
  sentence works well" — that is a UX article talking, not a product.
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
