# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (landing page):** hiring managers and recruiters evaluating David Vasquez. They want evidence that he can spot a real operational problem, scope a tool, and ship it end to end.
- **Secondary:** support agents and support leads on Intercom who might install and use the extension.
- **Extension users:** Customer Care agents working a high-volume Intercom queue (chat and email), drafting replies, handoff notes, and escalations all shift.

## Product Purpose

Support Copilot for Intercom is an open-source Chrome extension. One click reads the open Intercom conversation, optionally searches the team's help center, and runs two Claude calls in parallel: one writes the requested draft, the other writes an agent-only triage analysis (likely issue, category, missing info, suggested next step). Replies land in Intercom's composer for review. Escalations land in a separate copy panel so they can never reach the customer.

Success: an agent spends the shift on the customer, not on rewriting the same reply or hand-filling escalation templates.

## Positioning

Built by a support agent, not an engineer, from his own queue. The mechanism a generic AI tool cannot claim: it reads the live Intercom thread in place, answers only from the team's own help center articles, and structurally separates customer-facing replies (injected) from internal escalations (copy panel only).

## Operating Context

- Lives in the Chrome toolbar while the agent works in app.intercom.com.
- Six modes: Chat reply, Email reply, Conversation notes (injected into composer); Tier 2 escalation, Slack urgent, Billing escalation (copy panel).
- Optional "Extra context" field the agent fills in; it outranks everything else in the prompt.
- Setup: Claude API key, agent name, company, optional help center search URL, optional tone and style rules.

## Capabilities and Constraints

- Plain JavaScript, Chrome Manifest V3, no server, no build step. Files: popup.js (UI), content.js (Intercom DOM extraction and composer injection), background.js (KB search, prompts, parallel Claude calls).
- Default model: Claude Haiku 4.5. Roughly 1-2 s per draft; about a cent per conversation.
- The API key lives in chrome.storage.local and calls go straight to Anthropic.
- Not on the Chrome Web Store; installed via Load unpacked from the GitHub repo.
- Landing page: a single static index.html served by GitHub Pages from the repo root. No build tooling.

## Brand Commitments

- Name: "Support Copilot for Intercom" (short form "Support Copilot").
- Extension icon: assets/icon.svg and PNG sizes in assets/.
- Voice: plain, specific, first-person from someone who worked the queue. No hype, no em dashes, none of the AI-giveaway phrases the extension itself bans.

## Evidence on Hand

- demo/demo.gif: real screen recording of the extension in Intercom.
- demo/main.png, demo/settings.png: real popup screenshots.
- CHANGELOG.md: version history v1 to v4.
- Repo: https://github.com/4erosol/support-copilot-intercom, MIT license.
- Absent, never fabricate: users or install counts, testimonials, company names, time-saved metrics, Chrome Web Store listing. Demo conversations on the landing page are sample data and must be labelled as such.

## Product Principles

1. Agents stay in control: on demand, never automatic.
2. Never invent: answers come from the help center or the draft says you're looking into it.
3. Internal stays internal: escalations are structurally kept out of the customer-facing composer.
4. Show the work: the analysis panel tells the agent what's missing before they reply.

## Accessibility & Inclusion

No product-specific requirement established beyond WCAG AA on the landing page.
