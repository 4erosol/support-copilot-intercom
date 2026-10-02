---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface: landing page (index.html)

Scope: the GitHub Pages landing page for Support Copilot for Intercom. Visitor mode: Persuade.

Audience: hiring managers first (evidence David can find a real problem and ship), support agents second (could install it).
Action: run the demo (primary), then open GitHub / install (secondary).
Proof: the interactive demo on three labelled sample tickets, the real demo GIF, the guardrail comparison.
Kept sections (user confirmed): Demo (lead), Guardrails comparison, How it works + architecture (merged, compact), Setup / install.
Cut (user confirmed): problem cards, six-mode bento (merged into demo), build-story timeline, duplicate CTA band.
Constraints: single static index.html, no build step, GitHub Pages; light theme by use scene (daytime laptop, office light); no fabricated metrics or users; sample conversations labelled as samples.

## Direction contract

THESIS: The page is a two-part carbonless triage form split by a perforation. One conversation goes in; the output separates onto colour-coded copies: the white CUSTOMER side (Intercom thread and composer, where replies land) and the canary AGENT side (request type, the agent-only analysis, and the internal copy where escalations land, never sent). Pink was dropped during build: the product's real split is two-way, and a third paper colour blurred it. Refuses the category default: centered hero, browser-frame screenshot, rows of equal feature cards, indigo gradient.

OWN-WORLD: Bond-white and saturated canary sheets; every rule, label and checkbox printed in one carbon-blue form ink; one stamp red reserved for do-not-send marks: the INTERNAL stamp, and the REJECTED stamp and correction marks on the rejected draft in Guardrails (a rejected draft is a do-not-send). A copy-distribution legend and form number sit at the foot of the demo form. Perforation lines, printed field boxes with small-caps labels, tear-off stubs, a form number in the corner. Archivo across widths (condensed for field labels and the form title, regular for body), Courier Prime for typed-in field values. Square corners throughout.

STORY: Visitor first reads what the extension is and sees the real recording, then sees one conversation become correctly routed copies in under ten seconds, switches tickets and modes to test it, believes the escalation can never reach the customer, then reads the guardrails, the three-file mechanism, and installs.

FIRST VIEWPORT: User-directed change (2026-10-02, after seeing the build): a visitor landing on the demo first could not tell what the product is, so the first viewport now explains before it demonstrates. Header band (wordmark; tabs Demo, Guardrails, How it works, Install; GitHub). Left column: the plain-language headline, a one-paragraph explanation (free Chrome extension for support agents on Intercom), a three-row printed instructions box (open a conversation, pick what you need, review and send; escalations never reach the customer), "Try the demo" as the primary action, install as secondary, and the byline. Right column: the real screen recording as the attached proof. The live demo form follows as the second section under "Try it on a sample ticket." with a one-line legend (left is the customer's Intercom conversation, right is the popup only the agent sees), at full width, with all fix-round-1 rules kept (composer and first analysis row visible once the demo is scrolled to; phone section strip; canary below the perforation on phones).

FORM: Carbon-copy triage form, position 1 on the grounded list (Impeccable's pick, user-chosen over the assigned flight-strip board); seed key 65b8c034.

SIGNATURE INTERACTION: User-directed change (2026-10-02): the extension shown in the demo must be faithful to the real tool, never restyled. The agent side is an exact replica of popup.html (its own tokens, system font, emoji icons, Draft/Settings/Log header, Agent Analysis panel, Replies and Escalations buttons, Extra context, Draft panel with Insert into Intercom, red escalation panel, and popup.js's real status messages and sequence), sitting on the canary agent-side ground. The customer side is likewise a replica of Intercom's new inbox in dark theme, as in the real recording (header with name and subject, email cards or chat bubbles with avatars, composer with channel picker and Send pill); page annotations sit outside the replica window, never inside it. Ticking a reply mode pastes the draft into the Intercom composer on the white side; an escalation fills only the popup's escalation panel and the composer reads "Composer untouched". The page's own world (form ink, canary, perforation, ticket stubs) frames the demo and never restyles the product. The real popup screenshots (demo/main.png, demo/settings.png) sit in How it works; the real recording sits in the intro.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
