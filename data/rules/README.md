# Domain rules

The dataset in `data/datasets/` measures how references **look**. This directory
records what a domain **requires**, with the source cited for every number.

It exists because a design shipped a password field reading "At least 12
characters". Twelve is not a figure OWASP uses — the thresholds are 8 with MFA
and 15 without — and no gate in this repo could have caught it, because
`contrast.js` measures colour and `datasetTally.js` counts references. Neither
knows anything about passwords.

**The rule for this directory: a number without a source does not belong here.**
Each file names where its figures came from and when they were read, so a stale
rule can be re-checked rather than trusted.

Unlike `data/datasets/`, these files are committed: they are written analysis of
public standards, not captures of third-party sites.

| File | Covers | Source |
| --- | --- | --- |
| `authentication.md` | password length, composition, masking, login and signup error wording | OWASP Authentication Cheat Sheet |

Read the relevant file at gate 3, alongside the constraints file. A design that
contradicts one goes in the Deviations table with a stated reason, or it does
not ship.
