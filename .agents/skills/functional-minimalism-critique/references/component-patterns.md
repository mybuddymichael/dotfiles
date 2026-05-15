# Component Critique Patterns

Specific guidance for evaluating common UI components through functional minimalism principles.

## Price Display

**Evaluate:**
- Is price the dominant element through scale, not weight?
- Is there context (bids, original price, status)?
- Is the currency symbol proportional or oversized?

**Rams approach:**
- Light weight at large size reads as confident, not shouty
- Price should be 2-3x the size of surrounding text minimum
- Supporting context (bids, reserve status) on same visual plane

**Common issues:**
- Bold price competing with bold title
- Price isolated without validation context
- Currency symbol same size as numerals

## Buttons & CTAs

**Evaluate:**
- Is there one primary action per view?
- Do secondary actions visually recede?
- Is the button width intentional (full-width, content-width, or aligned to grid)?

**Rams approach:**
- Primary: high contrast, simple label, no icons unless essential
- Secondary: ghost/outline treatment, same size but reduced weight
- Never: gradients, shadows, multiple colors, excessive border-radius (>12px)

**Common issues:**
- Multiple buttons with equal visual weight
- Button width that doesn't align to any system
- "Learn more" and "Get started" fighting for attention

## Status Indicators

**Evaluate:**
- Is status clearly distinguished from actions?
- Does color usage follow conventions (green=positive, red=negative)?
- Is status text self-explanatory without icons?

**Rams approach:**
- Status is a noun, action is a verb — style accordingly
- No underlines on status text (underlines = interactive)
- Color alone shouldn't carry meaning (accessibility)

**Common issues:**
- Status styled as links (underlined, link-colored)
- Icons doing work that text should do
- Mixing status and actions on same line without distinction

## Navigation & Tabs

**Evaluate:**
- Is current state clearly indicated?
- Do inactive items visually recede without disappearing?
- Is the click target generous (44px minimum)?

**Rams approach:**
- One indicator system (underline OR background, not both)
- Current state: full opacity; inactive: reduced opacity or lighter weight
- No hover states that are more prominent than active states

**Common issues:**
- Active and inactive tabs nearly identical
- Hover effect stronger than selected state
- Too many navigation items (consider if >5)

## Cards & Containers

**Evaluate:**
- Does the card border/shadow serve a purpose?
- Is internal spacing consistent with the broader system?
- Does hover state add information or just decoration?

**Rams approach:**
- Borders = grouping, Shadows = elevation
- Don't use both unless indicating true layering
- Hover: subtle shadow increase, not color change or scale

**Common issues:**
- Cards with borders AND shadows AND background color
- Inconsistent internal padding
- Hover states that distract from content

## Form Inputs

**Evaluate:**
- Is the affordance clear (looks editable)?
- Does focus state have sufficient contrast?
- Are labels positioned consistently?

**Rams approach:**
- Subtle background or underline for inactive state
- Border appears/darkens on focus
- Labels above or inline, never floating/animated

**Common issues:**
- Inputs that look like display text
- Focus state that's barely perceptible
- Floating labels that obscure placeholder text

## Lists & Data

**Evaluate:**
- Is the list format necessary or would prose work?
- Are bullets earning their place?
- Is vertical rhythm consistent?

**Rams approach:**
- Two items: write as prose ("Includes X and Y")
- Bullets only when scanning/comparison is essential
- If bulleting, make each item substantive (1-2 sentences minimum)

**Common issues:**
- Bullet lists for 2-3 simple items
- Mixed bullet styles in same view
- Inconsistent indentation

## Accordions & Disclosure

**Evaluate:**
- Is progressive disclosure necessary or just hiding mess?
- Are section labels self-explanatory?
- Is expanded/collapsed state clear?

**Rams approach:**
- Use when content is optional, not when it's essential
- Chevron right = collapsed, chevron down = expanded (consistent)
- Don't accordion the primary content

**Common issues:**
- Essential information hidden in accordions
- Multiple accordions open simultaneously causing scroll confusion
- Inconsistent chevron/plus/minus indicators

## Images & Media

**Evaluate:**
- Is the image doing work or just decoration?
- Is the aspect ratio intentional?
- Do thumbnails have consistent treatment?

**Rams approach:**
- Images should be the content, not decoration around content
- Consistent aspect ratios within a collection
- No border-radius on photos unless systematic

**Common issues:**
- Hero images that push key info below fold
- Mixed aspect ratios in grids
- Decorative images that add no information

## Empty States

**Evaluate:**
- Is the message actionable?
- Does it explain what would be here and how to get it?
- Is the visual treatment appropriately subdued?

**Rams approach:**
- Text explains state + action in one sentence
- No sad mascots, excessive illustrations
- Primary action to resolve empty state should be obvious

**Common issues:**
- Empty states with more visual weight than populated states
- No clear path to populate the view
- Decorative illustrations that don't aid understanding
