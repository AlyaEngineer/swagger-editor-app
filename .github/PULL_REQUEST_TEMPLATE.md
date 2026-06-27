## Summary
<!-- Why are the changes needed? Short context. -->

## Changes Made
<!-- What was done and how -->

## Related issue

Closes #

## Feature
<!-- Which feature from the Functional Requirements this PR delivers, or which feature it partially contributes to (e.g. Feature 3: Swagger Editor):

Feature 1: App Header
Feature 2: Sign In / Sign Up
Feature 3: Swagger Editor
Feature 4: Swagger Viewer
Feature 5: History and Analytics
Feature 6: About Page
Feature 7: General Requirements
Feature 8: YouTube Video

Also add the matching label from the Labels panel on the right. -->

## Acceptance criteria
<!-- Tick only the criteria this PR delivers. For the final develop → main PR: fill in Total. -->

<details>
<summary><strong>Feature 1: App Header</strong></summary>

- [ ] Non-auth users see Sign In / Sign Up in header (upper right) — 15
- [ ] Auth users see History / Sign Out in header — 10
- [ ] About link in header and footer — 10
- [ ] Expired/invalid token → redirect from private routes to Main — 10
- [ ] Sign In / Sign Up buttons redirect to respective form route — 15

</details>

<details>
<summary><strong>Feature 2: Sign In / Sign Up</strong></summary>

- [ ] Sign In / Sign Up / Sign Out buttons present everywhere they should be — 10
- [ ] Client-side validation (email, password: 8+ chars, letter+digit+special, Unicode) — 20
- [ ] Successful login → redirect to Main — 10
- [ ] Logged-in user on Sign In / Sign Up routes → redirect to Main — 10

</details>

<details>
<summary><strong>Feature 3: Swagger Editor</strong></summary>

- [ ] Load/paste schema in JSON and YAML — 25
- [ ] Auto-detect input format (JSON vs YAML) — 20
- [ ] Format switch with JSON ↔ YAML conversion, no data loss — 20
- [ ] Schema validation with error indication — 15
- [ ] Auth users save schema; restored on next login — 10
- [ ] Viewer auto-populates with endpoints on valid schema — 10
- [ ] Responsive split view (horizontal/vertical by orientation) — 20

</details>

<details>
<summary><strong>Feature 4: Swagger Viewer</strong></summary>

- [ ] Endpoint list organized by path/method — 20
- [ ] Details: method, path, all param types (path/query/header/cookie) — 25
- [ ] Request schema and example payloads displayed — 20
- [ ] Response schema, examples, all status codes displayed — 25
- [ ] Try-It-Out: fill params/headers/body, execute, show response — 20
- [ ] Generate cURL + copy-to-clipboard — 10

</details>

<details>
<summary><strong>Feature 5: History and Analytics</strong></summary>

- [ ] SSR-generated; empty state with links to editor/viewer — 15
- [ ] Requests sorted by timestamp (most recent first) — 10
- [ ] Server-side analytics: duration, status, timestamp, method, request size, response size, error details, endpoint/URL — 45

</details>

<details>
<summary><strong>Feature 6: About Page</strong></summary>

- [ ] Public route, accessible to all — 5
- [ ] Info about RS School course — 5
- [ ] Team info (names, roles, GitHub links) — 10
- [ ] Design consistent with the app — 5

</details>

<details>
<summary><strong>Feature 7: General Requirements</strong></summary>

- [ ] i18n: 2+ languages with toggler in header — 30
- [ ] Sticky header with animation on stick — 10
- [ ] User-friendly error display — 10
- [ ] Private routes protected (401 if not authenticated) — 5

</details>

<details>
<summary><strong>Feature 8: YouTube Video</strong></summary>

- [ ] 5–7 min YouTube walkthrough linked, covers all criteria — 50

</details>

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would break existing functionality)
- [ ] Documentation update

## Checklist

- [ ] Self-review done
- [ ] No console errors / warnings / logs
- [ ] No `any` / `@ts-ignore`
- [ ] Tests added / updated and passing
