# design.md

Design rules for this project. Template by @abrekov.design.
Replace everything in [square brackets] and delete what doesn't apply.
Claude Code only auto-loads CLAUDE.md, so add this line to CLAUDE.md: @design.md

## Feel

- In three words: [calm, premium, bold]
- Looks like: [link or screenshot of a reference]. What I like about it: [lots of white space, huge headings]
- Never: [gradients, stock photos, emoji in the UI]

## Colors

- Background: [#0E0E0E]
- Surface (cards): [#1A1A1A]
- Text: [#F5F5F5]. Secondary text: [#A3A3A3]
- Brand / main action: [#D7FF3A]
- Error: [#FF4D4D]. Success: [#3DDC84]
- Use only these colors. If you need a new one, ask me first.

## Typography

- Font: [Heebo] for headings and body
- Sizes: H1 [56px], H2 [36px], H3 [24px], body [17px], small [14px]
- Weights: headings [700], body [400]
- Line height: headings [1.1], body [1.6]

## Spacing and shape

- Spacing scale: [4, 8, 12, 16, 24, 32, 48, 64]. No other values.
- Page side padding: mobile [16px], desktop [64px]
- Max content width: [1200px]
- Corner radius: buttons [999px], cards [20px], inputs [12px]
- Shadows: [none, use borders instead]

## Components

- Primary button: [brand background, dark text, full rounded]
- Secondary button: [transparent, 1px border]
- Cards: [surface color, 20px radius, 24px padding]

## Motion

- Duration: [200ms] for small UI, [400ms] for page elements
- Easing: [ease-out]
- Respect prefers-reduced-motion

## Language and direction

- [Hebrew, RTL. Use logical properties (start/end), not left/right.]
