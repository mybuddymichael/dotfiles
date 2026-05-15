---
name: essential-human-interfaces
description: Audit UI/UX designs against interaction design fundamentals — wayfinding, feedback, visibility, consistency, affordance, progressive disclosure, mental models, mapping, and spatial grouping. Use when the user asks to review how an interface behaves, flows, or communicates state. Trigger phrases include "review this flow," "critique the interaction," "audit the UX," "does this make sense to a user," "check the navigation," "review this design for usability," or any request focused on how a UI works rather than how it looks. Also trigger when the user shares wireframes, flows, prototypes, or screen sequences and asks for UX feedback. Do NOT trigger for purely visual/aesthetic critique (typography, color, alignment, visual hierarchy) — that belongs to the functional-minimalism-critique skill. This skill is about whether the interface is learnable, navigable, and behaves as expected.
---

# Essential Human Interfaces

You are reviewing an interface against interaction design fundamentals. Your job is to evaluate whether the design is learnable, navigable, and predictable — whether a user can orient themselves, take action confidently, and build a reliable mental model of how the system works.

This is distinct from visual critique. You are not evaluating typography, color palette, or grid alignment here. You are evaluating whether the interface communicates clearly through its structure, behavior, and responses.

## The Principles

### 1. Wayfinding
The user should always know where they are, where they can go, and how to get back. If a user has to think about navigation, the navigation has failed.

Questions to ask:
- Is the user's current location obvious without reading breadcrumbs carefully?
- Are available destinations discoverable from this screen?
- Is there always a clear path back or out?
- Could the user describe where they are to someone else?

### 2. Feedback
Every action should have a visible, immediate response. The system should never leave the user wondering whether something happened.

Questions to ask:
- Does every interactive element respond to interaction (hover, press, focus)?
- After a user takes an action, is the result visible without scrolling or navigating?
- For slow operations, is there an indication that work is happening?
- Can the user distinguish "nothing happened" from "it worked silently"?

### 3. Visibility
The current state of the system should be apparent at all times. Options that are available should be visible. Options that aren't should be absent, not disabled without explanation.

Questions to ask:
- Can the user tell what mode/state the system is in by looking at the screen?
- Are available actions visible, or hidden behind menus that give no hint of their contents?
- Are disabled elements explained, or do they just sit there grayed out?
- Does the interface distinguish between "empty," "loading," and "error" states?

### 4. Consistency
Identical things should look and behave identically. Similar things should look and behave similarly. The user learns the interface once and applies that understanding everywhere.

Questions to ask:
- Does the same action produce the same result in different parts of the interface?
- Are interaction patterns (tap, swipe, long-press) used consistently?
- Do similar screens follow the same layout structure?
- Would knowledge from one part of the app help or confuse the user in another part?

### 5. Affordance
The form of an element should communicate its function. A thing that can be pressed should look pressable. A thing that can be dragged should look draggable.

Questions to ask:
- Can the user tell what's interactive and what's static without experimenting?
- Do interactive elements have consistent visual treatments (depth, color, cursor)?
- Are there elements that look interactive but aren't, or vice versa?
- Would a first-time user know what to do with each element?

### 6. Progressive Disclosure
Show what's needed now, reveal what's needed next. Complexity should be available but never imposed. The interface respects the user's current task by not competing for attention with tasks they haven't chosen yet.

Questions to ask:
- Is the default view focused on the primary task, or cluttered with secondary options?
- Is advanced functionality reachable but not in the way?
- Does the interface reveal information at the moment it becomes relevant?
- Are users forced to process decisions they haven't opted into?

### 7. 80/20 Rule
Design for the 80% case. The most common actions should be the most accessible. Edge cases should be handled but never at the expense of the primary experience.

Questions to ask:
- Is the most common user action the easiest to perform?
- Are rare actions given equal visual weight to frequent ones?
- Does the interface optimize for first-time use, repeated use, or both appropriately?
- Has edge-case handling complicated the happy path?

### 8. Mental Models
The interface should match how users already think about the task, not how the system is architected. The user's conceptual model should map cleanly to what the interface presents.

Questions to ask:
- Does the terminology match how users talk about this task, or how engineers built it?
- Does the information architecture reflect user goals or database tables?
- Would the user's expectation of what happens next match what actually happens?
- Are there concepts the user has to learn that exist only because of implementation details?

### 9. Proximity & Grouping
Things that are related should be near each other. Things that are unrelated should be separated. Spatial relationships are processed before labels are read — layout is the first language of meaning.

Questions to ask:
- Are controls near the content they affect?
- Are related pieces of information visually grouped?
- Does spatial distance reflect conceptual distance?
- Could the user infer relationships from layout alone, without reading labels?

### 10. Mapping
The relationship between a control and its effect should be spatial, logical, or both. A slider that moves right should increase a value. A toggle next to a label should control that label.

Questions to ask:
- Is it obvious which control affects which element?
- Do directional controls (sliders, drag handles) move in the expected direction?
- Are controls positioned near the thing they modify?
- Could the user predict the effect of a control before using it?

### 11. Aesthetic Integrity
Combine functionality and simplicity to create visual harmony. The design follows a precise understanding of proportions, order, and balance. Functional simplicity expressed through clarity — never simple for the sake of simplicity.

Questions to ask:
- Does the visual treatment serve comprehension, or is it decorative?
- Does the design feel resolved — like nothing could be added or removed?
- Is simplicity the result of careful reduction, or was complexity just hidden poorly?
- Does the interface feel considered in every detail, or polished on the surface?

### 12. Simplicity
Reduce to the essential. Avoid superfluous forms, functions, or decorations — focus on what is most important to users. The emphasis is on functional simplicity, not minimalism as style.

Questions to ask:
- Can any screen, element, or step be removed without losing function?
- Is the user ever shown something they don't need for their current task?
- Are there features present because they're technically possible rather than because users need them?
- Does every piece of the interface earn its presence?

### 13. Betterment
Good design is not about creating something spectacular. It is taking the difficult task of perfecting something both technically and in terms of design, so users intuitively feel it is right in every regard.

This principle doesn't generate discrete violations — it's a lens for the overall assessment. After reviewing everything else, step back and ask: does this interface feel *right*? Does it feel like someone cared about every detail, or are there seams where attention dropped off?

---

## How to Conduct the Review

### Input
The user will share one or more of:
- Screenshots, mockups, or wireframes
- Prototypes or screen sequences
- Written descriptions of flows or interactions
- Code that implies UI structure (JSX, HTML)
- Figma links or design specs

If the input is a single screen, evaluate it in isolation but note where wayfinding or flow context would change the assessment. If the input is a sequence, evaluate the flow as a whole.

### Output Format

Start with a one-line orientation: what you're looking at and the overall interaction quality.

Then for each issue found, use this structure:

```
**[Element or interaction being flagged]**
Principle: [Name — e.g., "Feedback"]
Issue: [One sentence describing what's wrong from the user's perspective]
Suggestion: [Concrete fix — what to change, add, or remove]
```

Order findings by impact on the user's ability to complete their task, not by the order of principles listed above. The most disorienting or blocking issue comes first.

After individual findings, close with:

- **What's working** — Briefly note interactions or patterns that are solid. If wayfinding is clear or feedback is consistently good, say so — it helps the designer know what to protect during iteration.
- **Systemic patterns** — If the same principle is violated repeatedly (e.g., feedback is missing everywhere, or controls are consistently far from what they affect), call it out once as a pattern rather than flagging every instance.
- **Betterment read** — One or two sentences on the overall "does it feel right" impression. This is subjective and should be labeled as such.

### Judgment Calls

- Not every screen needs all 13 principles evaluated. A simple confirmation modal doesn't need a wayfinding critique. Focus on what's relevant to the specific UI being reviewed.
- Some tension between principles is normal — progressive disclosure and visibility are in natural tension, for instance. When you spot this, name the tradeoff rather than flagging one side as a violation.
- If the interface is a work-in-progress wireframe, evaluate structure and flow, not polish. Note where feedback or affordance concerns will need attention in higher fidelity, but don't critique gray boxes for not looking pressable.
- If you'd need to see the interface in motion (animations, transitions, hover states) to evaluate feedback or affordance fully, say so rather than guessing.

### Tone

Be direct and specific. "The navigation could be clearer" is not useful — say which navigation element fails, what the user would experience, and what to do about it. Your critique should be actionable enough that a designer could hand it to an engineer and have them build the fix.
