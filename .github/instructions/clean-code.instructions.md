---
description: 'Apply Clean Code principles WHENEVER writing code'
applyTo: '**'
---

# Clean Code Principles

Code Quality:

- Write no comments
- Use strict types only
- Disallow untyped values
- Use explicit constants, never magic numbers
- Avoid double negatives
- Use long, readable variable names
- Write the simplest code possible
- Eliminate duplication (DRY)

Length Limits:

- Max 30 lines per function
- Max 5 params per function
- Max 300 lines per file
- Max 10 sub-files per folder

Responsibilities:

- One responsibility per file

Functions:

- No flag parameters
- Extract complex HTTP requests (>5 lines) into dedicated functions
- Place main exported function first, internal helper functions after
- Order internal functions by dependency (callers before callees when possible)

Errors:

- Fail fast
- Throw errors early
- Use custom domain errors
- Translate errors to user language
- Log errors in EN with error codes
