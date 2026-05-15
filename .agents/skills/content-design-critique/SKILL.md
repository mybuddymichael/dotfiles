---
name: content-design-critique
description: Audit UI copy against a principled checklist and return a structured critique with specific rewrites. Use when the user explicitly asks to review, audit, critique, or check UI writing, microcopy, interface text, button labels, error messages, empty states, tooltips, onboarding copy, modal copy, or any other user-facing strings in an interface. Trigger phrases include "review this copy," "check this content," "check the UI writing," "audit these strings," "critique the microcopy," "how's the content." Trigger when the user's goal is evaluation, not just generation. Do NOT auto-trigger when generating UI copy or content as part of another task — only when the user asks for a review.
---

# Content design critique

You are reviewing user-interface text against a set of principles. Your job is to be specific, honest, and useful — flag what violates a principle, briefly explain why, and offer a concrete rewrite.

## Principles

These are the rules. Every piece of UI content under review gets measured against them.

### 1. Show, don't tell

Let the interface demonstrate through interaction rather than telling a user what to do with text. If the UI already communicates something through layout, affordance, or state change, the text is redundant.

### 2. Use the active voice

Avoid passive constructions.

- ✗ "Your account could not be found"
- ✓ "We couldn't find your account"

### 3. Speak as the platform, not the user

Avoid impersonating the user, or using first-person singular possessive pronouns.

- ✗ "Go to My Settings"
- ✓ "Go to your settings"

### 4. Use common nouns

Don't create proper nouns for product elements. A common noun is normally more friendly and accessible.

- ✗ "Log into your ProductName User Account"
- ✓ "Log into your account"

### 5. Be brief

Remove extraneous words. Note: this principle is dependent on context. Some contexts (modals, dialogs, banners) use full sentences. Other contexts (buttons, headers, field labels, toasts) do not require full sentences.

Button:

- ✗ "Click here to save your changes"
- ✓ "Save changes"

Toast:

- ✗ "Your invoice has been successfully sent"
- ✓ "Invoice sent"

Confirmation modal:

- ✗ "Are you sure you want to delete this project? If you delete this project, you will lose access to all your files and tasks on this project."
- ✓ "Deleting this project will also delete all its files and tasks."

### 6. Be direct

Cut hedging words, like "might," "perhaps," "we think," "it seems like." Avoid "please"—don't apologize in UI content, except in very occasional, highly critical circumstances. Instead, give the user the most relevant information and offer a solution or action if possible.

- ✗ "Please review the following errors before submitting"
- ✓ "3 errors need to be fixed before you can submit. [Include: links to errors]"

### 7. Front-load information

Put the most important word or concept first. Users scan beginnings.

- ✗ "Your export is ready to download"
- ✓ "Export ready. [CTA: Download]"

### 8. Be specific

Prioritize direct, specific information, and where possible, offer the user an action or solution.

- ✗ "This bill can't be paid. Either it requires approvals, or you don't have the required permissions."
- ✓ "This bill needs to be approved by [name of user]. [CTA: Resend for approval]"

### 9. Empty states are onboarding

Empty states tell the user how to populate the screen or container, and briefly explain the value. The typical empty state header reads "Add [name of entity]," and the body copy explains what the entity is or does. Body copy should not be more than 3 lines.

- ✗
  Header: "No invoices found"
  Body: "You don't have any invoices yet."
- ✓
  Header: "Add an invoice"
  Body: "Track what clients owe and when payments are due. Create your first invoice to get started."

### 10. Errors need exits

Lead with what the user can do, not what went wrong technically.

- ✗ "Error 403: Authentication failed due to invalid credentials"
- ✓ "Try again" or "Use a different email"

### 11. Use sentence case

All UI content uses sentence case. This includes headers, buttons, field labels. Navigation-level features (e.g. Change Orders, Purchase Orders, Client Updates, Lead Activities) can be capitalized as proper nouns. User titles (e.g. subs/vendors) do not need to be capitalized.

If a navigation-level feature name is also a common noun (e.g. invoices, bills, documents, files), determine whether the term needs to be capitalized based on context. If the term is being used as a common noun as part of a sentence, it does not need to be capitalized. If the product treats the feature name as a formal proper noun, capitalize it consistently.

### 12. Don't use directional language

A user might be using the product on their phone or using an assistive technology. Avoid terms that assume a screen type, direction, proximity, or color: "click," "tap," "below," "to the right." Instead use "select," "choose," "go to," "open."

- ✗ "Click the menu on the left"
- ✓ "Open the menu"

- ✗ "Tap the green button to continue"
- ✓ "Select Continue"

### 13. Use product tone

The tone should be appropriate to UI content. Don't use marketing or benefit-selling language - you don't need to upsell the product to the user, as they're already using it. Instead, prioritize direct, informational content, with clear outcomes and actions.

Empty state:

- ✗
  Header: "Use the Schedule to stay on top of your project"
  Body: "Keep your whole team aligned and moving forward together."
- ✓
  Header: "Add a Schedule item"
  Body: "Get a full view of your job from start to finish. Create your first item to get started."

---

## How to conduct the review

### Input

The user will share UI content. This might be:

- Raw strings (button labels, headlines, body text, error messages)
- A screenshot or mockup
- A code snippet with embedded copy (JSX, HTML, etc.)
- A spreadsheet or list of strings

If the input is code, extract the user-facing strings and review those. Ignore variable names, comments, and non-rendered text.

### Check component guidelines

If the user's input references a specific component or pattern (e.g. toast, banner, item header, tooltip, popover, empty state), check any available project documentation, design system docs, Storybook, component guidelines, or nearby implementation examples for content guidance. If you find relevant guidance, apply it and cite the file or source. If no component-specific guidance is available, say so briefly and continue using the principles in this skill.

### Output format

Start with a one-line summary of overall quality — don't pad it, just say where things stand.

Then for each piece of copy that has an issue, use this structure:

```
**[Original copy or string]**
Principle violated: [Name — e.g., "Challenge every word"]
Why: [One sentence explaining the problem in context]
Rewrite: [Your suggested replacement]
```

Group findings by screen, component, or logical section if the input is large enough to warrant it.

After the individual callouts, end with:

- **Patterns** — if you see the same violation repeating (e.g., hedging throughout, or company-centric voice everywhere), call it out once as a systemic note rather than flagging every instance individually.

### Severity scale

Organize output based on severity. There are three levels of severity:

1. Blocking - the user can't complete their goal, or might take the wrong action because the content is misleading, missing, or contradictory. E.g. errors with no exit, ambiguous CTAs on important workflows.
2. Confusing - the user can complete their goal, but the content creates friction or erodes trust. E.g. passive voice, vague empty states, hedging on error messages.
3. Needs finesse - e.g. wordiness, doesn't use sentence case correctly, tone is slightly off.

### Judgment calls

Not every principle applies to every string. Use judgment:

- A single "OK" button doesn't need a front-loading critique.
- Legal or compliance copy (terms acceptance, cookie banners) plays by different rules — note where principles conflict with regulatory requirements rather than just flagging violations.
- Placeholder text and dev-only strings aren't worth reviewing unless the user specifically asks.
- If the copy is good, note this and move on. Don't manufacture critique.

If principles conflict, prioritize the user's ability to complete their goal. E.g. If an error message needs more words to provide a real exit, prioritize clarity over the principle "Be brief."

### Tone of the critique

Be direct and specific, indicating which principles are broken and what changes the user could make. Avoid softening language in the critique itself (no hedging).
