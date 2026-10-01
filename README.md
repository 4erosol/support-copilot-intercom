# Support Copilot for Intercom

A Chrome extension that gives customer support agents on-demand AI drafts inside Intercom: chat and email replies, internal notes, escalation write-ups, and a quick triage analysis of every conversation. It's powered by Claude.

I built this while working as a Customer Care agent at a B2B SaaS company. I wasn't on the engineering team. I spotted a recurring pain point in my own day-to-day work, scoped a tool to fix it, and shipped it end to end with AI-assisted development. This repo is a generalized version that works with any Intercom workspace.

## The problem

Support agents in a high-volume Intercom queue spend most of their time on work that isn't problem-solving:

- **Rewriting the same reply over and over**, while trying to keep the tone consistent with the team's style guide.
- **Writing escalations by hand.** Every Tier 2 ticket needs the same structured fields (priority, affected entity, error, timestamps, screenshots), and missing fields cause back-and-forth with engineering.
- **Switching context** between the conversation, the help center, Slack and the escalation queue.
- **Hallucination risk with generic AI tools.** Pasting a conversation into a chatbot gets you confident answers about features that don't exist.

## The solution

One click in the extension popup:

1. Reads the open conversation straight from Intercom's DOM, for both chat and email threads.
2. Searches your help center for relevant articles (optional).
3. Runs **two Claude calls in parallel**:
   - **Draft:** the reply, note or escalation you asked for.
   - **Analysis:** likely issue, category, missing info and suggested next step, shown only to the agent.
4. Injects the reply into Intercom's composer, ready to review and send. Escalations go to a copy panel instead, because they belong in other tools.

## Features

| Mode | What it produces | Where it goes |
|---|---|---|
| Chat reply | Conversational reply, intro on first message only | Injected into composer |
| Email reply | Slightly more formal, ends with "Best," (Intercom adds the signature) | Injected into composer |
| Conversation notes | 3-5 sentence internal summary for handoffs | Injected into composer |
| Tier 2 escalation | Structured template with P1-P5 priority classification | Copy panel |
| Slack urgent | 3-5 sentence summary for high-urgency, high-impact issues | Copy panel |
| Billing escalation | Neutral internal note for the billing team | Copy panel |

**Guardrails built into the prompts**

- Answers only from the help center articles it retrieved. If nothing relevant comes back, the draft tells the customer you're looking into it instead of inventing steps.
- Never promises fixes, ETAs or outcomes that haven't been confirmed.
- Never blames the customer, never calls something "a bug" in customer-facing text, and never leaks internal ticket IDs or processes.
- Bans common AI giveaway phrases ("Great question!", "Let's dive into...") and em dashes.
- Puts agent-supplied context at the top of the prompt as the highest-priority instructions.

## Product decisions worth calling out

- **On-demand, not automatic.** v1 fired on every conversation open. It burned API calls and produced drafts nobody asked for. v2 switched to explicit actions.
- **Escalations are never auto-injected.** Injecting the escalation template into the customer-facing composer broke formatting and risked an internal note being sent to a customer. A separate copy panel removed that failure mode.
- **Parallel analysis at no extra latency.** The triage panel runs alongside the draft, so agents see what info is missing before they reply. That cuts down on "can you send a screenshot?" round trips.
- **Resilient DOM extraction.** Intercom renames its CSS classes without warning. Every selector has an ordered fallback chain, and when extraction returns nothing, the Log tab dumps diagnostic class hints so the fix takes minutes, not hours.
- **Cheap, fast model by default.** Claude Haiku 4.5 handles structured drafting well and responds in 1-2 seconds.

## Setup

### 1. Get a Claude API key
Create one at https://console.anthropic.com/ (billing must be set up).

### 2. Install the extension
1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder

### 3. Configure
Open the extension popup and go to **Settings**:

| Setting | Purpose |
|---|---|
| Claude API key | Required. Use **Test key** to verify it. |
| Your name | Used in the first-message intro ("My name is ..."). |
| Company name | Used to frame the model's role. |
| Knowledge base search URL | Optional. A help center search endpoint that accepts `?query=...&per_page=N` and returns `{ articles: [{ title, body }] }`, e.g. Zendesk Guide's `/api/v2/help_center/articles/search`. Chrome asks you to grant access to that domain when you save. |
| Tone and style instructions | Free-form team rules appended to every prompt. See [`docs/tone-and-style-template.md`](docs/tone-and-style-template.md) for a starting point. |

## Usage

1. Open a conversation in Intercom.
2. Click the extension icon and choose a mode.
3. Optionally add **Extra context** that isn't in the thread, e.g. `Customer is on the Pro plan. Already tried clearing cache.`
4. Review the **Agent Analysis** panel.
5. Review the draft in Intercom's composer (or in the popup if injection failed), edit it and send.

## Architecture

```
popup.html / popup.js   UI: mode buttons, settings, analysis panel, debug log
        │  chrome.tabs.sendMessage
        ▼
content.js              Runs on *.intercom.com / *.intercom.io
                        - Shadow-DOM-aware conversation extraction
                        - Role detection (customer / agent / bot / system)
                        - ProseMirror composer injection
        │
popup.js ──chrome.runtime.sendMessage──▶ background.js (service worker)
                        - Help center keyword search
                        - Parallel Claude calls (draft + analysis)
                        - Per-mode system prompts
```

No server and no build step: plain JavaScript on Manifest V3.

## Customization

- **Prompts:** `background.js` → `buildSystemPrompt()` and `buildAnalysisPrompt()`
- **Model:** `CLAUDE_MODEL` at the top of `background.js`
- **New response type:**
  1. Add a button with `data-mode="yourmode"` in `popup.html`
  2. Add it to `MODE_LABELS` (and `ESCALATION_MODES` if it shouldn't be injected) in `popup.js`
  3. Add a prompt branch in `buildSystemPrompt()`

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Could not reach Intercom tab" | Make sure a conversation is open on app.intercom.com, then refresh the page. |
| "No conversation found" | Intercom probably changed its markup. Check the **Log** tab for the diagnostic class hints and update the selectors in `content.js` → `extractConversation()`. |
| "Compose box not found" | The draft is still in the popup. Edit it there and click **Insert into Intercom**. |
| "KB: no articles found" | Normal for niche questions. The draft won't invent an answer. |
| API 401 / 429 / 5xx | Invalid key / rate limited / Anthropic outage (status.anthropic.com). |

## Security notes

- The API key is stored in `chrome.storage.local` and is never synced.
- The extension calls the Anthropic API directly from the browser using the `anthropic-dangerous-direct-browser-access` header. That's acceptable for a personal or internal tool where each agent uses their own key. A team-wide deployment should proxy requests through a backend instead.
- Conversation content is sent to the Anthropic API to generate drafts and is not stored anywhere except the rolling 100-line debug log.

## Version history

See [CHANGELOG.md](CHANGELOG.md).

---

Built by [David Vasquez](https://github.com/4erosol).
