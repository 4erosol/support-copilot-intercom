# CHANGELOG

All notable changes to Support Copilot for Intercom are tracked here.

Versioning follows [Semantic Versioning](https://semver.org/):
- **MAJOR** (x.0.0): breaking changes or full architectural rewrites
- **MINOR** (x.1.0): new features or non-breaking enhancements
- **PATCH** (x.x.1): bug fixes, selector updates, small tweaks

The version in `manifest.json` is the source of truth. Bump it on every release.

---

## [4.0.0] - 2026-10-01

Generalized from a single-company internal tool into an extension that works with any Intercom workspace.

### Added
- **Settings for agent name, company name, and knowledge base search URL.** Prompts are no longer tied to one company, agent, or help center.
- **Runtime host permission for the knowledge base.** The help center domain is requested through `optional_host_permissions` when settings are saved, instead of being hardcoded in the manifest.
- **PNG toolbar icons** (16/32/48/128). Chrome does not render SVG manifest icons.
- `docs/tone-and-style-template.md`, a starting point for team-specific tone and style instructions.

### Changed
- Renamed to **Support Copilot for Intercom**, with a new icon and a neutral indigo color theme.
- The "SL2" escalation mode is now **Tier 2 escalation** (`tier2`).
- The analysis prompt uses generic categories and a generic missing-info checklist.
- The model ID is centralized in a single `CLAUDE_MODEL` constant.
- KB search is skipped (and logged) when no search URL is configured.

---

## [3.2.0] - 2026-04-27

### Added
- **Brand identity in the popup.** Logo in the header, with the primary color used for active states, focus rings, and the Insert button.
- **Custom icon for the extension itself** instead of a generic placeholder.
- **CSS custom properties** for all colors, radii, and shadows. Retheming the popup only requires changing the variables at the top of `popup.html`.
- **Subtle shadows and focus rings** on buttons and inputs.

### Changed
- Popup width increased from 400px to 420px.
- Header switched from dark navy to white for a cleaner look.
- Status messages no longer use em dashes (per agent style preference).
- The escalation textarea is now editable so drafts can be tweaked before copying.

### Removed
- Unused `notifications` permission.

### Fixed
- Monospace font stack now prefers SF Mono / Menlo / Consolas for sharper rendering.

---

## [3.1.0] - 2026-04-27

### Fixed
- **DOM extraction broke after an Intercom CSS rename.** Intercom switched from `inbox2__` to `inbox-2__` class names and moved message parts to a Tailwind-based `group/content-part` class. All extraction selectors now try multiple variants in order, so a single rename no longer breaks the extension.
- **Role detection no longer requires `data-part-group-category`.** Added fallbacks based on ancestor layout classes (`justify-end` / `flex-row-reverse` for agents, `justify-start` for customers) and `data-author-type`. If every method fails, the message is still included with role `'message'` instead of being dropped.
- **"non ISO-8859-1 code point" error on API calls.** API keys are now sanitized to strip invisible unicode characters copied along from the Anthropic console.

### Added
- Diagnostic logging when extraction returns 0 messages. The Log tab now shows which selector matched and prints class hints from the DOM, so future Intercom changes are quick to identify.

---

## [3.0.0] - 2026-03-10

### Added
- **Agent Analysis panel** showing Likely Issue, Category, Missing Info, and Suggested Next Step. It runs in parallel with the draft, so it adds no latency.
- **Escalation copy panels.** Escalations now appear in a dedicated panel for copy/paste instead of being injected into Intercom, which had been breaking template formatting.
- **Slack urgent escalation mode**, a short paragraph format reserved for high-urgency, high-impact issues.
- **Embedded team guidelines** for client responses, escalation drafting, and escalation routing, built into the system prompts.
- **Anti-hallucination rule.** When KB search returns nothing, the model is told to say it's looking into the issue rather than inventing features or steps.
- **Extra context priority.** Agent-supplied context moved to the top of the prompt as an `AGENT INSTRUCTIONS (HIGHEST PRIORITY)` block.

### Changed
- `max_tokens` raised to 1200 for escalation templates and longer emails.
- Conversation history cap raised from 10 to 40 messages.
- Rewritten in plain JavaScript so it runs entirely in the browser with no server dependency.

---

## [2.0.0] - 2026-02

### Added
- Full rewrite as on-demand only (no MutationObserver auto-firing).
- Tab-based popup UI: Draft / Settings / Log.
- Help center KB search integration.
- Per-mode system prompts (chat / email / escalation / billing / notes).
- Manual Insert button as a fallback when auto-injection fails.

### Fixed
- Role detection switched from CSS class heuristics to the `data-part-group-category` attribute (`1` = customer, `3` = agent, `5` = bot, `20` = system).
- Email vs chat detection via email metadata containers.

---

## [1.0.0] - 2026-01

Initial version (Python prototype).

- Auto-fired on conversation open.
- Single mode (chat reply only).
- Hardcoded system prompt.
