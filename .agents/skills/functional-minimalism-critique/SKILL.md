---
name: functional-minimalism-critique
description:
  Provide UI/UX critique based on essential design and interaction principles
  for digital interfaces. Use when reviewing screenshots, mockups, or design
  comps. Triggers on requests like "review this design", "what's wrong with this
  UI", "critique this layout", "how can I improve this screen", or any design
  feedback request mentioning minimalism, Apple-like, or functional design.
---

# Functional Minimalism UI Critique

Provide design critique through the lens of these ten principles, adapted for
modern digital interfaces. If you do not understand the customer problem, ask
for qualitative or quantitative input to help guide decisions.

## Core Philosophy

Every pixel must earn its place. Every interaction must feel inevitable. Every
element must serve both function and meaning. We succeed when we understand the
user problem and context better than anyone else can and deliver a design that
meets these principles:

## Design principles

1. **Better** — Good interface design is not about creating something spectacular for its own sake. It is the difficult work of perfecting something technically and experientially until users intuitively feel it is right in every regard.
2. **Useful** — Every component is highly functional and useful, with a deep
   understanding of human behavior; designed to the smallest details to meet
   user needs. The design makes technology accessible and intuitive to use.
3. **Aesthetic** — Combine functionality and simplicity to create visual
   harmony. The design follows a precise understanding of proportions, order,
   and balance. Designs should be functional and stand out for their simplicity,
   clarity, and harmony.
4. **Understandable** — Interface should be self-explanatory
5. **Unobtrusive** — The interface disappears; the content speaks
6. **Honest** — Materials and interactions behave as expected
7. **Long-lasting** — Timeless over trendy and fashionable.
8. **Thorough** — Nothing arbitrary, obsess over details
9. **Sustainable** — Optimize for performance
10. **Simple** — Achieve the greatest possible simplicity and clarity in use,
    construction, and design. Reduce to the essential, avoiding superfluous
    forms, functions, or decorations and instead focus on what is most important
    to users. The emphasis is on functional simplicity that is visually
    expressed in a design that is as clear as it is individual.

## Interaction Principles

These govern how the interface _behaves_, not just how it looks. A visually
clean interface can still fail if it violates these.

- **Wayfinding** — The user always knows where they are, where they can go, and
  how to get back. If a user has to think about navigation, the navigation has
  failed.
- **Feedback** — Every action has a visible, immediate response. The system
  never leaves the user wondering whether something happened. Silence is the
  worst form of feedback.
- **Visibility** — Current system state is apparent at all times. Options that
  are available should be visible. Options that aren't should be absent, not
  disabled without explanation.
- **Consistency** — Identical things look and behave identically. Similar things
  look and behave similarly. Every inconsistency is a micro-lesson the user
  didn't ask for.
- **Affordance** — The form of an element communicates its function. When
  affordance is strong, instructions are unnecessary.
- **Progressive Disclosure** — Show what's needed now, reveal what's needed
  next. Complexity should be available but never imposed.
- **80/20 Rule** — Design for the 80% case. The most common actions should be
  the most accessible. Edge cases should be handled but never at the expense of
  the primary experience.
- **Mental Models** — The interface should match how users already think about
  the task, not how the system is architected. When expectation and behavior
  align, the interface becomes invisible.
- **Proximity & Grouping** — Related things should be near each other. Spatial
  relationships are processed before labels are read — layout is the first
  language of meaning.
- **Mapping** — The relationship between a control and its effect should be
  spatial or logical. When mapping is natural, learning cost is zero.

## UI Writing Principles

Copy is part of the interface. Every word is a design decision.

- **Show, don't tell** — Let the interface demonstrate through interaction. If
  you need a paragraph to explain how something works, the design needs work,
  not more words.
- **Users first** — Avoid "we" and company-centric language. "Your settings are
  updated" not "We've updated your settings."
- **Challenge every word** — If removing a word doesn't change the meaning,
  remove it. "Please click the button below to continue" → "Continue."
- **No hedging** — Cut "might," "perhaps," "we think," "it seems like."
  Uncertain language makes the interface feel uncertain.
- **Front-load meaning** — Put the most important word first. "Delete this
  project permanently?" not "Are you sure you want to permanently delete this
  project?"
- **Match the moment** — Tone reflects the user's emotional state and the
  stakes. Confirmations can be brief. Destructive actions need clarity. Errors
  need a path forward, not an apology.
- **One idea per surface** — A heading does one job. A button label does one
  job. When a string tries to inform, persuade, and instruct simultaneously, it
  does none well.
- **Verbs for actions, nouns for navigation** — Buttons: "Save," "Export,"
  "Remove." Links: "Settings," "Account," "History." Mixing these erodes the
  mental model.
- **Write for the scan** — The first two words should carry the message. The
  full sentence is there for those who need it.
- **Name things once** — If a feature is called "Collections" in the nav, it's
  "Collections" everywhere. Synonyms create cognitive load.
- **Empty states are onboarding** — Tell the user what will appear and give a
  single clear action to begin. No decorative illustrations.
- **Errors need exits** — Lead with what the user can do. "Try again" or "Use a
  different email" over "Error 403: Authentication failed."

## Critique Framework

When reviewing a design, evaluate these dimensions in order:

### 1. Hierarchy

- Is there one clear focal point?
- Can the user identify the primary action in under 3 seconds?
- Does visual weight match importance?

### 2. Alignment & Rhythm

- Is there a single dominant axis?
- Does the eye travel smoothly or jump around?
- Are deviations from the grid intentional or accidental?

### 3. Information Architecture

- Does each piece of information appear exactly once?
- Are related items grouped? Unrelated items separated?
- Is the reading order logical: what → how much → what to do?

### 4. Affordances & Mapping

- Do interactive elements look interactive? Do static elements look static?
- Is the distinction between status and action clear?
- Does the relationship between a control and its effect feel obvious?

### 5. Orientation & Feedback

- Does the user know where they are and how to get back?
- Does every action produce a visible, immediate response?
- Are unavailable options absent rather than disabled without context?

### 6. Progressive Disclosure & 80/20

- Is the primary path unobstructed by edge-case features?
- Is complexity available but not imposed?
- Are the most common actions the most accessible?

### 7. Typography

- Is there a clear type scale with purpose?
- Are weights used sparingly and meaningfully?
- Is emphasis achieved through size/space rather than decoration?

### 8. Color

- Is color used sparingly and with meaning?
- Is there one accent color maximum for actions?
- Do colors communicate state (success, error, neutral)?

### 9. Reduction

- Can any element be removed without loss of function?
- Are there redundant labels, icons, or decorations?
- Is whitespace being used as an active design element?

## Critique Response Format

Structure feedback as:

**What's working:** Brief acknowledgment of successful elements (2-3 points max)

**What creates friction:** Specific issues tied to principles, ordered by impact

**Suggested refinements:** Concrete changes, from highest to lowest impact.
Include ASCII mockups or restructured layouts when helpful:

```
Element A
Element B · Element C

[ Primary Action ]

Secondary info
```

## Common Anti-Patterns

Flag these when spotted:

- **Scattered alignment** — Multiple axes without purpose
- **Redundant information** — Same data in multiple places
- **Mixed affordances** — Links that look like buttons, status that looks like
  links
- **Decoration without function** — Icons, gradients, shadows that don't
  communicate
- **False grouping** — Proximity implying relationship where none exists
- **Competing emphasis** — Multiple elements fighting for attention
- **Orphaned elements** — Items visually disconnected from related content

## Language Guidelines

- Be direct, not harsh
- Name the principle being violated
- Offer a simple yes/no question that validates the fix
- Acknowledge when something is "close" vs. needs major rework
- End with clear next steps, not open questions

## Example Critique Pattern

> **What's working:** The price commands attention through scale alone — no bold
> needed. Clear vertical rhythm from title to action.
>
> **What creates friction:** "Watching" floating right breaks the single-axis
> alignment you've established. It's the only right-aligned element, which makes
> it feel orphaned rather than intentional.
>
> **Suggested refinement:** Move "Watch" inline with the status line:
>
> ```
> You're winning · Watch
> ```
>
> **The test:** Can the eye travel straight down the left edge without jumping?
> If yes, you're there.
