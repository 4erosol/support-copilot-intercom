//  Support Copilot for Intercom - Background Service Worker

// The KB search URL is configured in Settings. It should point at a help center search
// endpoint that accepts `?query=...&per_page=N` and returns `{ articles: [{ title, body }] }`
// (e.g. a Zendesk Help Center: https://help.example.com/api/v2/help_center/articles/search).
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL   = 'claude-haiku-4-5-20251001';

// Simple debug logger that stores timestamped messages in chrome.storage, keeping only the last 100 entries to avoid bloat.
function debugLog(msg) {
  const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
  chrome.storage.local.get('debugLog', ({ debugLog }) => {
    const log = (debugLog || []).concat(entry).slice(-100);
    chrome.storage.local.set({ debugLog: log });
  });
}

// ── Message router ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GENERATE_DRAFT') { generateDraft(msg.data).then(sendResponse); return true; }
  if (msg.type === 'TEST_API_KEY')   { testApiKey(msg.key).then(sendResponse);     return true; }
});

// ── Main generator ────────────────────────────────────────────────────────────
// Main orchestrator: fetches KB articles (if not an escalation), makes two parallel API calls (one for analysis, one for draft), and returns both results.
async function generateDraft({ mode, messages, isEmail, customerName, customInstructions, extraContext }) {
  const { claudeApiKey, kbSearchUrl, agentName, companyName } =
    await chrome.storage.local.get(['claudeApiKey', 'kbSearchUrl', 'agentName', 'companyName']);
  if (!claudeApiKey) return { error: 'No API key saved. Open Settings.' };

  const profile = {
    agent:   agentName?.trim()   || '',
    company: companyName?.trim() || 'the company'
  };

  try {
    const isEscalation = mode === 'tier2' || mode === 'slack' || mode === 'billing';
    // Skip KB search for escalations since they don't need article context
    const kbArticles   = !isEscalation
      ? await searchKB(kbSearchUrl, messages[messages.length - 1]?.text || '')
      : [];

    if (kbArticles.length > 0) {
      debugLog(`KB: ${kbArticles.length} article(s) found: ${kbArticles.map(a => a.title).join(' | ')}`);
    } else if (!isEscalation) {
      debugLog(kbSearchUrl ? 'KB: no articles found for this query.' : 'KB: no search URL configured, skipping.');
    }

    // Always generate analysis alongside the main output — runs both calls in parallel for speed
    const [analysisResult, draftResult] = await Promise.all([
      callClaude(claudeApiKey, buildAnalysisPrompt(profile), buildAnalysisContent(messages, customerName, extraContext)),
      callClaude(claudeApiKey, buildSystemPrompt(mode, customInstructions, profile), buildUserContent(mode, messages, isEmail, customerName, kbArticles, extraContext))
    ]);

    if (analysisResult.error) return { error: analysisResult.error };
    if (draftResult.error)    return { error: draftResult.error };

    return { ok: true, draft: draftResult.text, analysis: analysisResult.text };

  } catch (err) {
    return { error: err.message };
  }
}

// Calls Claude API with system and user prompts. Using Haiku 4.5 since it's fast and cheap for this use case.
// Note: The 'anthropic-dangerous-direct-browser-access' header is required for calling the API directly from the browser (not recommended for production apps that handle sensitive data, but fine for internal tools).
async function callClaude(key, system, userContent) {
  // Strip any non-ASCII characters from the key. Invisible unicode characters
  // sometimes get copied along with the key from the Anthropic console and
  // would cause a "non ISO-8859-1 code point" error in the HTTP header.
  const safeKey = String(key).replace(/[^\x20-\x7E]/g, '').trim();

  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         safeKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: userContent }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: `Claude API error ${res.status}: ${err?.error?.message || res.statusText}` };
  }
  const data = await res.json();
  return { text: data.content?.[0]?.text?.trim() || '' };
}

// ── Analysis prompt (always runs) ────────────────────────────────────────────
function buildAnalysisPrompt({ company }) {
  return `You are an internal analysis assistant for a Customer Care agent at ${company}.
Read the conversation and produce a brief internal analysis. This is NOT shown to the customer.

Output format (plain text, no markdown, no headers with # symbols):

LIKELY ISSUE
One sentence describing what is probably going on.

CATEGORY
One of: Authentication / Email & Notifications / Data & Documents / Integrations / Payments & Billing / Desktop App / Mobile App / Performance / Other

MISSING INFO
List any information not yet collected that would be needed to resolve or escalate (e.g. affected account, exact error message, time of error, screenshots, steps to reproduce). If nothing is missing, write "None identified."

SUGGESTED NEXT STEP
One sentence on what the agent should do next.

Keep each section to 1-3 lines maximum. Be direct and factual. No speculation about root cause.`;
}

function buildAnalysisContent(messages, customerName, extraContext) {
  let content = '';
  if (extraContext?.trim()) content += `AGENT CONTEXT: ${extraContext.trim()}\n\n`;
  content += `Customer: ${customerName}\n\n=== CONVERSATION ===\n`;
  for (const m of messages.slice(-40)) {
    const label = m.role === 'customer' ? 'CUSTOMER' : m.role === 'agent' ? 'AGENT' : m.role === 'bot' ? 'BOT' : 'SYSTEM';
    content += `${label}: ${m.text}\n\n`;
  }
  return content;
}

// ── System prompts ────────────────────────────────────────────────────────────
function buildSystemPrompt(mode, customInstructions, { agent, company }) {
  const custom = customInstructions?.trim() ? `\nADDITIONAL AGENT INSTRUCTIONS:\n${customInstructions.trim()}\n` : '';
  const role   = `a Customer Care agent at ${company}`;
  const intro  = agent
    ? `"Hi [name], thank you for reaching out. My name is ${agent}, and I'm part of the Customer Care team."`
    : `"Hi [name], thank you for reaching out. I'm part of the Customer Care team."`;

  const toneRules = `
TONE AND LANGUAGE RULES:
- Sound like something you would say out loud. Use words a normal person would use.
- Professional, respectful, and human. Never robotic or overly formal.
- Acknowledge the customer's concern before suggesting next steps.
- Never sound defensive or dismissive. Never blame the customer or imply user error.
- Empathy should be brief and natural, not exaggerated.
- Never say: "You're absolutely right", "Let's dive into", "I completely understand your frustration" (rephrase naturally), "Certainly!", "Absolutely!", "Great question!"
- Never use em dashes. Use commas, periods, or restructure the sentence.
- Do not over-format with bullet points unless the reply genuinely benefits from them.
- Keep responses concise. Focus on the next actionable step.
- Do not ask multiple unrelated questions in a single message.
- Never reference internal ticket IDs, internal logs, or internal system processes in customer-facing messages.
- Do not promise fixes, timelines, or outcomes that are not confirmed.
- Never say "This appears to be a bug" or "The problem is on our side." Use neutral phrasing like "Let me review this further from our side."`;

  const noHallucinate = `
CRITICAL: Answer ONLY from the KB articles provided. If the KB does not cover the question, tell the customer you are looking into it and will follow up. Do NOT invent steps, features, navigation paths, or procedures. If agent instructions are provided, follow them exactly and do not add anything not instructed.`;

  if (mode === 'chat') return `You are ${role} writing a CHAT reply in Intercom.
${toneRules}
${custom}
CHAT FORMAT:
- If this is the first agent message in the thread, open with: ${intro}
- Otherwise skip the intro and continue naturally.
- Walk through steps as prose paragraphs, not bullet lists.
- No sign-off needed.
- Standard response structure: (1) acknowledge concern, (2) short clarification if needed, (3) next step or information request, (4) offer continued help.
${noHallucinate}
Write ONLY the chat reply text, nothing else.`;

  if (mode === 'email') return `You are ${role} writing an EMAIL reply in Intercom.
${toneRules}
${custom}
EMAIL FORMAT:
- Open with "Hi [customer first name],"
- Thank them for reaching out or following up. Apologise for any delay if applicable.
- Get straight to the point.
- Close with "Best," on its own line. Do not add a name or signature (Intercom adds it automatically).
- Use paragraphs, not bullet lists.
- Standard response structure: (1) acknowledge concern, (2) short clarification if needed, (3) next step or information request, (4) offer continued help.
${noHallucinate}
Write ONLY the email body text, nothing else.`;

  if (mode === 'tier2') return `You are ${role} filling in a Tier 2 technical escalation for the engineering support queue.

ESCALATION WRITING RULES:
- Fields must be concise and precise. Avoid long explanations.
- Focus on observable behavior and confirmed facts only. No speculation about root cause.
- Prioritize technical signals: exact error messages, affected entities, timestamps, reproduction steps.
- Use plain text only. No asterisks, no bold, no markdown.
- If a field cannot be determined from the conversation, write "To be confirmed."

PRIORITY CLASSIFICATION:
P1 = System outage, security breach, or payment failure
P2 = Multiple customers affected or critical functionality broken
P3 = Major workflow disruption requiring investigation
P4 = Minor issue with workaround available
P5 = Cosmetic or informational issue

${custom}
Fill in the template below. Return ONLY the filled template, nothing else.`;

  if (mode === 'slack') return `You are ${role} writing a Slack escalation message for urgent issues.

SLACK ESCALATION RULES:
- Only used when BOTH conditions are true: high urgency AND high operational impact.
- Short paragraph summary. No template fields, no headers.
- Include: what the issue is, who is affected, what has been tried, and why it is urgent.
- Plain text only. No markdown.
- 3-5 sentences maximum.

${custom}
Write ONLY the Slack message text, nothing else.`;

  if (mode === 'billing') return `You are ${role} writing an internal billing escalation note.
Read the conversation and produce a concise internal note for the billing team covering:
- What the customer is disputing or requesting
- Relevant account details mentioned
- Timeline of events as described by the customer
- Recommended action or question for the billing team
Keep it factual and neutral. Plain text only. This is an internal note, not a customer reply.
${custom}
Write ONLY the internal note, nothing else.`;

  if (mode === 'notes') return `You are ${role} writing a brief conversation summary for internal notes.
Produce a concise summary covering: what the issue was, what was tried, current status, and any pending action items.
3-5 sentences maximum, written in past tense. Plain text only.
${custom}
Write ONLY the summary, nothing else.`;

  return `You are a helpful support agent at ${company}.`;
}

// ── User content builder ──────────────────────────────────────────────────────
function buildUserContent(mode, messages, isEmail, customerName, kbArticles, extraContext) {
  let content = '';

  if (extraContext?.trim()) {
    content += `=== AGENT INSTRUCTIONS (HIGHEST PRIORITY) ===\n${extraContext.trim()}\n=== END INSTRUCTIONS ===\n\n`;
  }

  if (kbArticles.length > 0) {
    content += '=== KNOWLEDGE BASE (use ONLY this to answer) ===\n';
    for (const a of kbArticles) content += `\n[${a.title}]\n${a.body}\n`;
    content += '\n=== END KB ===\n\n';
  } else if (mode === 'chat' || mode === 'email') {
    content += '=== KNOWLEDGE BASE ===\nNo articles found.\n=== END KB ===\n\n';
    content += '*** No KB articles found. Do NOT invent steps or features. Tell the customer you are looking into it. ***\n\n';
  }

  content += `Customer name: ${customerName}\nChannel: ${isEmail ? 'Email' : 'Chat'}\n\n`;
  content += '=== CONVERSATION ===\n';

  for (const m of messages.slice(-40)) {
    const label = m.role === 'customer' ? 'CUSTOMER' : m.role === 'agent' ? 'AGENT' : m.role === 'bot' ? 'BOT' : 'SYSTEM';
    content += `${label}: ${m.text}\n\n`;
  }

  if (mode === 'tier2') {
    content += `\nFill in this escalation template using only information from the conversation above:\n\n`;
    content += `Priority:\n\n`;
    content += `Description of the issue:\n\n`;
    content += `Entity affected:\n\n`;
    content += `Links to relevant details:\n\n`;
    content += `Error messages:\n\n`;
    content += `Time of error:\n\n`;
    content += `Screenshots attached:`;
  } else if (mode === 'slack') {
    content += '\nWrite the Slack escalation message:';
  } else if (mode === 'billing') {
    content += '\nWrite the billing escalation note:';
  } else if (mode === 'notes') {
    content += '\nWrite the conversation summary:';
  } else {
    content += '\nWrite the reply:';
  }

  return content;
}

// ── KB search ─────────────────────────────────────────────────────────────────
// Searches the configured help center by extracting keywords from the query (strips stop words, keeps meaningful terms).
// Returns up to 3 articles with HTML stripped and body truncated to 600 chars to stay within token limits.
async function searchKB(searchUrl, query) {
  if (!searchUrl) return [];
  try {
    const stopWords = new Set(['what','how','when','where','can','the','is','are','my','i','to','a','an','and','or','for','in','on','with','do','does','did','have','has','that','this','it','not','but','was','be','as','at','by','we']);
    const keywords = query
      .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w)).slice(0, 6).join(' ');
    if (!keywords) return [];
    const res  = await fetch(`${searchUrl}?query=${encodeURIComponent(keywords)}&per_page=3`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map(a => ({
      title: a.title || '',
      body:  (a.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)
    })).filter(a => a.body.length > 50);
  } catch { return []; }
}

// ── API key test ──────────────────────────────────────────────────────────────
async function testApiKey(key) {
  try {
    const safeKey = String(key).replace(/[^\x20-\x7E]/g, '').trim();
    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': safeKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 10, messages: [{ role: 'user', content: 'hi' }] })
    });
    return { ok: res.ok, status: res.status };
  } catch (err) { return { ok: false, error: err.message }; }
}
