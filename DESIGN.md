---
name: Support Copilot for Intercom
description: A carbonless triage form, printed in one carbon-blue ink on bond-white and canary copies.
colors:
  bond: "#FFFFFF"
  bond-2: "#F4F6FB"
  canary: "#FFDF3D"
  ink: "#1F35B5"
  ink-deep: "#14205E"
  ink-soft: "#4A5488"
  ink-on-canary: "#5C4A00"
  rule: "rgba(31, 53, 181, .32)"
  rule-strong: "rgba(31, 53, 181, .7)"
  stamp: "#CF2A1E"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(42px, 5vw, 72px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 72"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(36px, 4.6vw, 64px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 72"
  numeral:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 68"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "'tnum'"
  body-small:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.55
  button:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.55
    fontVariation: "'wdth' 90"
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.09em"
    fontVariation: "'wdth' 90"
  meta:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 90"
  stamp:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 75"
  typed:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0px"
  product-shot: "8px"
spacing:
  2xs: "6px"
  xs: "10px"
  sm: "14px"
  md: "18px"
  lg: "22px"
  xl: "48px"
  gutter: "clamp(16px, 3vw, 40px)"
  section: "clamp(72px, 9vw, 128px)"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bond}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "13px 20px"
  button-ink-hover:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.bond}"
  button-line:
    backgroundColor: "{colors.bond}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "13px 20px"
  button-line-hover:
    backgroundColor: "{colors.bond-2}"
    textColor: "{colors.ink}"
  button-copy:
    backgroundColor: "{colors.bond}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "5px 10px"
  tab:
    textColor: "{colors.ink-soft}"
    padding: "0 18px"
    height: "60px"
  tab-hover:
    backgroundColor: "{colors.bond-2}"
    textColor: "{colors.ink-deep}"
  ticket-stub:
    textColor: "{colors.ink-deep}"
    padding: "12px 18px 12px 22px"
  ticket-stub-selected:
    backgroundColor: "{colors.canary}"
    textColor: "{colors.ink-deep}"
  instructions-row:
    textColor: "{colors.ink-soft}"
    padding: "12px 16px 12px 14px"
  composer:
    backgroundColor: "{colors.bond}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
  stamp:
    textColor: "{colors.stamp}"
    typography: "{typography.stamp}"
    padding: "5px 9px"
  product-shot:
    rounded: "{rounded.product-shot}"
---

# Design System: Support Copilot for Intercom

## Overview

**Creative North Star: "The Carbonless Triage Form"**

The page is a printed business form. It uses bond-white and canary sheets, with every rule, label and stub printed in a single carbon-blue form ink. One stamp red is kept for marks that say "rejected, do not send". The demo form is split by a perforation. The white customer copy holds the Intercom thread and composer. The canary agent copy is a table on which the real extension popup sits, reproduced exactly. White is what the customer sees. Canary is what only the agent sees.

Density is that of a working form, not a brochure. The page uses hairline rules, small tracked labels, numbered printed boxes, and condensed heavy headlines that read like a form title. Courier Prime is reserved for marginal annotations, filenames and the terminal. Interaction is quiet. Picking a reply in the popup pastes it into the composer with a brief ink flash. Picking an escalation keeps it inside the popup. Page corners are square. Product evidence keeps its own shape: the recording, the popup screenshots and the popup replica. Product evidence lifts off the page; everything else is flat ruled paper.

**Key Characteristics:**
- Two paper colours carry meaning: bond-white is customer-facing, canary is agent-only.
- One ink for all page structure; no second accent hue.
- Stamp red only for rejected, do-not-send marks.
- Archivo across widths for the page; Courier Prime only for annotations, filenames, code and the terminal.
- Square corners, hairline and 1.5px ink rules, perforations and tear-off stubs as native devices.
- The real product appears as itself: a faithful popup replica plus real recordings and screenshots. It is exempt from the page's world rules.

## Colors

A two-paper, one-ink palette with a single red reserved for stamps. The palette applies to the page, not to the embedded product replica (see Components).

### Primary
- **Carbon Form Ink** (ink): used for every rule, label, control border, stub numeral, tab underline and focus ring, and for the agent's own messages in the thread. It is the colour the form is printed in.

### Secondary
- **Canary Copy** (canary): used for the agent side of the demo form (the table under the popup replica), the selected ticket stub, the Install section's paper, the highlighter on the approved draft, and text selection. Never used as a button fill.

### Tertiary
- **Stamp Red** (stamp): used for the REJECTED stamp, and for the strike-throughs, superscript markers and correction notes on the rejected draft. All are do-not-send marks.

### Neutral
- **Bond White** (bond): the page and the customer-side copy; fill of line buttons, the composer and code panels.
- **Cool Bond** (bond-2): hover wash on tabs, stubs, line buttons and copy buttons; the table header row; the rejected-draft sheet.
- **Deep Ink** (ink-deep): body text and headings; hover fill of the ink button.
- **Faded Ink** (ink-soft): secondary text on white, such as ledes, captions, notes, inactive tabs and the composer placeholder.
- **Canary Shadow Ink** (ink-on-canary): secondary text on canary, such as the agent-side head, install ledes and step descriptions. Used instead of faded ink because faded blue loses legibility on yellow.
- **Hairline Rule** (rule): 1px dividers between tabs, table rows, stubs and instruction rows.
- **Strong Rule** (rule-strong): composer border at rest, dashed note dividers, screenshot frames, scrollbars, stub perforation dots.

Inline code on canary sits on a 60% white wash so the paper reads through.

### Named Rules
**The Two Copies Rule.** Bond-white carries customer-facing content; canary carries agent-only content. Never put text the customer will receive on canary.

**The One Ink Rule.** All page structure is printed in Carbon Form Ink and its tints. There is no second accent hue; emphasis comes from weight, width and ink depth. The replica's indigo belongs to the product, not to the page.

**The Stamp Red Rule.** Stamp red marks only things that must not be sent. It is never an error colour, a link colour, or decoration. An approved stamp is printed in ink, not red.

## Typography

**Display Font:** Archivo variable, width 62-125 (with Helvetica Neue, Arial)
**Body Font:** Archivo at normal width
**Label/Mono Font:** Courier Prime (with Courier New) for annotations, filenames and code

**Character:** A single grotesque, stretched across its width axis, does the work of a form's printed type. It is condensed and heavy for titles, slightly narrowed for labels and buttons, and regular for reading. Courier Prime is the typewriter that wrote the margin notes.

### Hierarchy
- **Display** (800, clamp(42px, 5vw, 72px), 0.95, width 72%): the page title only, balanced wrap.
- **Headline** (800, clamp(36px, 4.6vw, 64px), 0.98, width 72%): section and demo headings, max 18ch.
- **Numeral** (800, 26px on stubs and instruction rows, 34px on install steps, width 68%, ink): ticket numbers and step counters, printed like form numbering.
- **Title** (700, 16-17px): row heads in tables, step names, fact heads.
- **Body** (400, 16px, 1.55, tabular numerals): running text. Ledes run at 18px within 50-58ch. Draft sheets run at 17px/1.6 within 52ch.
- **Body small** (400, 12.5-13.5px): stub subjects, composer notes, captions.
- **Label** (700, 11px, 0.09em, uppercase, width 90%, ink): printed labels on the form (side heads, band label), column heads, sheet captions, the byline label and the terminal head.
- **Meta** (600-700, 11.5px, 0.06em, uppercase, width 90%): message sender lines and the form foot.
- **Stamp** (800, 15px, 0.08em, uppercase, width 75%): rubber stamps only.
- **Typed** (Courier Prime, 14-15px): guardrail annotations (superscripts, correction notes, the approved-draft list), filenames and inline code in How it works, inline code in install steps, and the terminal (15px/1.8).

### Named Rules
**The Typewriter Rule.** Courier Prime is for annotations and machine text: margin notes, filenames, code and the terminal. Never use it for headings, labels or prose.

**The Width Axis Rule.** Hierarchy rides the width axis. Use 68-75% for titles, numerals and stamps, 85-90% for labels, brand and buttons, and 100% for reading text. Don't introduce a second sans on the page.

## Layout

Content sits in a 1320px max-width column with a fluid gutter (clamp(16px, 3vw, 40px)). The masthead is a sticky 60px band ruled off in 1.5px ink, with tabs as bordered cells to the right. The opening section has two columns: text at 1fr and the attached recording at 1.08fr, with a gap of clamp(28px, 4vw, 64px), vertically centred. It collapses to one column at 960px. The text column stacks the headline, lede, printed instructions box, actions and byline at a 22px gap.

The demo opens with its own header block under a 1.5px ink top rule (headline plus a one-line legend lede), then the form at full width. The form has a top band of ticket stubs and a three-track body: customer side, a 30px perforation track, and the canary agent side at 1.08fr. A ruled foot carries the form number and copy legend. The popup replica sits on the canary at up to 420px wide. Side insets are 22px (16px customer, 12px agent under 520px). At 860px the form stacks: the customer side, a horizontal perforation, then the canary side. Under 760px the tabs become a full-bleed, horizontally scrolling strip below the brand.

Sections are separated by generous vertical padding (clamp(72px, 9vw, 128px)) and 1.5px ink rules, and headings sit 48px above their content. Two-column content grids collapse to one column between 860px and 960px. These grids are the guardrail sheets, How it works (route table beside the screenshot pair and facts) and Install. Observed spacing steps are 6, 10, 14, 18, 22 and 48px. Inside the form the rhythm is tight; outside it, generous.

## Elevation & Depth

The page is flat ruled paper. Depth comes from paper colour, ink rules, and lift reserved for the product's evidence. That evidence is the demo form, the real screen recording, the real popup screenshots, and the popup replica sitting on the canary table. The form and the recording sit on the page with a 1px ink base line and a soft, low ambient shadow, like a sheet resting on a desk. The screenshots and the replica cast a softer, rounder shadow, as product chrome photographed onto the page. Page state is shown by printing, not lifting.

### Shadow Vocabulary
- **Sheet on the desk** (`box-shadow: 0 1px 0 var(--ink), 0 24px 48px -28px rgba(20, 32, 94, .35)`): the demo form and the attached screen recording.
- **Product shot** (`box-shadow: 0 10px 28px -12px rgba(20, 32, 94, .35)`): the real popup screenshots.
- **Popup on the table** (`box-shadow: 0 14px 36px -10px rgba(20, 32, 94, .35), 0 2px 6px rgba(20, 32, 94, .12)`): the popup replica on canary.
- **Tab underline** (`box-shadow: inset 0 -3px 0 var(--ink)`): the current section tab.
- **Filled ring** (`box-shadow: 0 0 0 4px rgba(31, 53, 181, .12)`): the composer once a draft is pasted, entered through a 0.9s flash from an 8px ring at 22%.

### Named Rules
**The Evidence Lift Rule.** Only product evidence lifts off the page: the live demo form, the real screen recording, the real popup screenshots, and the popup replica on its canary table. Sections, guardrail sheets, the instructions box, tables and code panels are flat, bordered in ink.

## Shapes

Page corners are square (0px), and the form language is rectangles ruled in ink. Borders come in two weights: 1.5px solid ink for objects and section edges, and a 1px hairline for internal divisions. Annotation lists use dashed strong rules. Round shapes are reserved for two cases. The first is print artefacts: the dotted perforation line, the stub-edge perforation dots and the white disc behind the scissors mark. The second is product evidence, which keeps the product's own geometry: the popup screenshots are framed at 8px, and the replica uses popup.html's 6-8px radii. Stamps are the one rotated page shape (-6deg, multiply blend).

## Components

### Buttons
Printed, flat, and firm.
- **Shape:** square (0px), 1.5px ink border.
- **Ink:** ink fill, white text, 13px 20px padding, Archivo 700 at 90% width, and a 17px Phosphor icon with a 10px gap. Hover deepens to ink-deep.
- **Line:** white fill, ink text and border. Hover washes to cool bond.
- **Copy (small):** white fill, ink border and text, 5px 10px padding, 12.5px. The label swaps to "Copied" for 1.6s. Used on the terminal panel.
- **Press:** a 1px downward nudge on :active; colour transitions take 0.2s.

### Instructions box
- **Style:** a flat numbered list inside a 1.5px ink border, with rows split by 1px rules. Each row has a 26px condensed ink numeral in a 40px column and 15.5px faded-ink text with the lead phrase in bold ink-deep, inset 12px 16px 12px 14px.

### Composer
- **Style:** a white box with a 1.5px strong-rule border, 14px 16px padding and 15px body text.
- **Filled:** ink border plus the filled ring, entered with a 0.9s ink flash.
- **Held (escalation picked):** the placeholder turns ink and semibold to say nothing was pasted.

### Ticket stubs
- **Style:** tear-off stubs in the form's top band, hairline-separated, with a perforated dotted left edge. Each carries a condensed ink numeral, a name and a small channel-and-subject line.
- **State:** hover washes to cool bond; the selected stub turns canary.

### Navigation
- **Style:** bordered tab cells in the masthead, 14px semibold faded ink.
- **States:** hover washes to cool bond and deepens the text. The current section carries a 3px inset ink underline. The GitHub tab is printed in ink.
- **Mobile:** on phones the strip scrolls horizontally, full bleed.

### Stamp
- **Style:** a static stamp with a 2.5px stamp-red border, condensed uppercase 800, rotated -6deg, multiply blend, 90% opacity, pinned to the corner of a guardrail sheet. REJECTED is red; APPROVED is printed in ink.

### Perforation
- **Style:** a 30px canary track with a 15px white margin, a dotted ink line (6px by 11px dot pitch, 75% opacity) and a scissors mark at the top. It turns horizontal on stacked layouts.

### Product evidence frames
- **Screen recording:** a 1.5px ink frame with a ruled caption strip, lifted as a sheet on the desk.
- **Popup screenshots:** a two-up grid with a 16px gap. Each shot has an 8px radius, a 1px strong-rule border, the product-shot shadow and a 13.5px faded-ink caption below.

### Popup replica (embedded product, exempt)
The agent side holds an exact replica of the real extension popup. Its markup and values are copied from popup.html: scoped indigo brand tokens, the system font stack, emoji action icons, 6-8px radii, soft indigo-tinted shadows and a 0.25s fade-in. **popup.html is the normative source;** this document deliberately does not restate its values. The page contributes only the canary table it sits on and its outer drop shadow. Square corners, One Ink, Archivo and the no-emoji rule do not apply inside it. The replica's styling never leaks out into the page.

### Named Rules
**The Faithful Replica Rule.** The popup replica is a copy of popup.html, never a restyle. When the product's popup changes, copy the change across; never bend it toward the page's ink, type or corners, and never let its indigo, emoji, radii or system font spread into the page.

## Do's and Don'ts

### Do:
- **Do** print every rule, label, stub and page control in Carbon Form Ink; use ink-deep for reading text.
- **Do** keep customer-facing content on bond-white and agent-only content on canary (The Two Copies Rule).
- **Do** use ink-on-canary, not ink-soft, for secondary text on canary.
- **Do** set annotations, filenames, code and terminal text in Courier Prime; everything else on the page in Archivo.
- **Do** carry hierarchy on Archivo's width axis: 72% for headings, 90% for labels and buttons, 100% for body.
- **Do** keep page corners square and borders at 1.5px ink (objects) or 1px rule (divisions).
- **Do** keep the popup replica identical to popup.html (The Faithful Replica Rule).

### Don't:
- **Don't** use stamp red for errors, links, emphasis or decoration; it marks do-not-send only.
- **Don't** add a third paper colour; the product's split is two-way.
- **Don't** round page corners; only print artefacts and product evidence are round.
- **Don't** lift anything but product evidence; no card shadows, no diagonal hard offset shadows.
- **Don't** place uppercase labels above headings as kickers or eyebrows; the label style is for printed labels, column heads and sheet captions only.
- **Don't** fill buttons with canary; canary is paper and highlighter.
- **Don't** use emoji or the system font stack on the page; they belong only inside the popup replica.
- **Don't** use Courier Prime for prose, headings or labels.
