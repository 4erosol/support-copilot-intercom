//  Support Copilot for Intercom - Popup Script

// Simple shorthand for document.getElementById to keep things tidy
const $ = id => document.getElementById(id);

// Escalation modes don't get auto-injected into Intercom since they're meant to be copied elsewhere
const ESCALATION_MODES = new Set(['tier2', 'slack', 'billing']);
const MODE_LABELS = {
  chat:    'Chat reply',
  email:   'Email reply',
  notes:   'Conversation notes',
  tier2:   'Tier 2 escalation',
  slack:   'Slack Urgent',
  billing: 'Billing Escalation'
};

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    $(`tab-${btn.dataset.tab}`).classList.add('active');
    if (btn.dataset.tab === 'debug') loadDebugLog();
  });
});

// ── Action button click → generate immediately ────────────────────────────────
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    generate(btn.dataset.mode);
  });
});

// Main generate function: reads the conversation from Intercom, sends it to the background worker for processing, and displays the result.
async function generate(mode) {
  setStatus('Reading conversation...', 'info');
  setAllBtnsDisabled(true);
  hidePanels();

  let tabId;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab?.id;
  } catch {}

  // Ask the content script to extract the conversation from the Intercom DOM
  let convData;
  try {
    convData = await chrome.tabs.sendMessage(tabId, { type: 'GET_CONVERSATION' });
  } catch {
    setStatus('Could not reach Intercom tab. Make sure a conversation is open.', 'error');
    setAllBtnsDisabled(false);
    return;
  }

  if (!convData?.ok) {
    setStatus(convData?.error || 'Failed to read conversation.', 'error');
    setAllBtnsDisabled(false);
    return;
  }

  $('convInfo').textContent = `${convData.customerName} · ${convData.isEmail ? 'Email' : 'Chat'}`;
  const { customInstructions } = await chrome.storage.local.get('customInstructions');
  const extraContext = $('extraContext').value.trim();

  setStatus('Generating...', 'info');

  // Send everything to the background worker to call Claude API
  const result = await chrome.runtime.sendMessage({
    type: 'GENERATE_DRAFT',
    data: {
      mode,
      messages:     convData.messages,
      isEmail:      convData.isEmail,
      customerName: convData.customerName,
      customInstructions,
      extraContext
    }
  });

  setAllBtnsDisabled(false);

  if (!result?.ok) {
    setStatus(result?.error || 'Unknown error.', 'error');
    return;
  }

  // Always show analysis panel with internal insights
  renderAnalysis(result.analysis);

  const isEsc = ESCALATION_MODES.has(mode);

  if (isEsc) {
    // Escalations are meant to be copied to Intercom/Slack/billing tools, so we show them in a read-only panel
    showEscalationPanel(result.draft, mode);
    setStatus('Review and copy the escalation draft below.', 'ok');
  } else {
    // Regular replies get auto-injected into the Intercom compose box AND shown in an editable panel as a fallback
    const injected = await injectIntoIntercom(tabId, result.draft);
    showDraftPanel(result.draft, mode);
    setStatus(
      injected
        ? 'Draft injected. Review in Intercom compose box.'
        : 'Compose box not found. Edit draft here and use Insert.',
      injected ? 'ok' : 'error'
    );
  }
}

// ── Analysis renderer ─────────────────────────────────────────────────────────
// Parses the structured analysis text returned by Claude and displays it in the analysis panel.
// The analysis follows a consistent format: LIKELY ISSUE, CATEGORY, MISSING INFO, SUGGESTED NEXT STEP.
function renderAnalysis(text) {
  if (!text) return;

  // Map section headers to their corresponding DOM elements
  const sections = {
    'LIKELY ISSUE':           'valIssue',
    'CATEGORY':               'valCategory',
    'MISSING INFO':           'valMissing',
    'SUGGESTED NEXT STEP':    'valNext',
  };

  const lines = text.split('\n');
  let currentKey = null;
  const collected = {};

  // Parse the plain text response into sections
  for (const line of lines) {
    const trimmed = line.trim();
    const matchedKey = Object.keys(sections).find(k => trimmed.toUpperCase().startsWith(k));
    if (matchedKey) {
      currentKey = matchedKey;
      const inline = trimmed.slice(matchedKey.length).replace(/^[\s:]+/, '');
      collected[currentKey] = inline ? [inline] : [];
    } else if (currentKey && trimmed) {
      if (!collected[currentKey]) collected[currentKey] = [];
      collected[currentKey].push(trimmed);
    }
  }

  // Update the UI with parsed values
  for (const [key, elId] of Object.entries(sections)) {
    const el = $(elId);
    if (el) el.textContent = (collected[key] || []).join(' ') || '...';
  }

  $('analysisPanel').classList.add('visible');
}

// ── Panel helpers ─────────────────────────────────────────────────────────────
function showDraftPanel(text, mode) {
  $('draftText').value = text;
  $('draftBadge').textContent = MODE_LABELS[mode] || mode;
  $('draftPanel').classList.add('visible');
}

function showEscalationPanel(text, mode) {
  $('escalationText').value = text;
  $('escalationTitle').textContent = (MODE_LABELS[mode] || 'Escalation').toUpperCase() + ' DRAFT';
  $('escalationPanel').classList.add('visible');
}

function hidePanels() {
  $('draftPanel').classList.remove('visible');
  $('escalationPanel').classList.remove('visible');
}

// ── Inject into Intercom ──────────────────────────────────────────────────────
async function injectIntoIntercom(tabId, text) {
  try {
    const res = await chrome.tabs.sendMessage(tabId, { type: 'INJECT_TEXT', text });
    return res?.ok || false;
  } catch { return false; }
}

// ── Insert button (manual fallback) ──────────────────────────────────────────
$('btnInsert').addEventListener('click', async () => {
  const text = $('draftText').value.trim();
  if (!text) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const ok = await injectIntoIntercom(tab?.id, text);
  setStatus(ok ? 'Inserted.' : 'Compose box not found.', ok ? 'ok' : 'error');
  setTimeout(() => setStatus(''), 2500);
});

// ── Copy buttons ──────────────────────────────────────────────────────────────
$('btnCopyDraft').addEventListener('click', () => {
  copyText($('draftText').value, $('btnCopyDraft'));
});
$('btnCopyEsc').addEventListener('click', () => {
  copyText($('escalationText').value, $('btnCopyEsc'));
});

function copyText(text, btn) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}

// ── Settings ──────────────────────────────────────────────────────────────────
async function loadSettings() {
  const data = await chrome.storage.local.get(['claudeApiKey', 'customInstructions', 'agentName', 'companyName', 'kbSearchUrl']);
  $('claudeKey').value          = data.claudeApiKey       || '';
  $('customInstructions').value = data.customInstructions || '';
  $('agentName').value          = data.agentName          || '';
  $('companyName').value        = data.companyName        || '';
  $('kbSearchUrl').value        = data.kbSearchUrl        || '';
}

$('btnSave').addEventListener('click', async () => {
  const key   = $('claudeKey').value.trim();
  const kbUrl = $('kbSearchUrl').value.trim();
  if (!key) { setSettingsStatus('API key is required.', 'error'); return; }

  // The help center can live on any domain, so host access is requested at runtime
  // (optional_host_permissions) instead of being hardcoded in the manifest.
  // chrome.permissions.request must run before any other await to keep the user gesture.
  if (kbUrl) {
    let origin;
    try { origin = new URL(kbUrl).origin; } catch {
      setSettingsStatus('Knowledge base URL is not a valid URL.', 'error'); return;
    }
    const granted = await chrome.permissions.request({ origins: [`${origin}/*`] }).catch(() => false);
    if (!granted) { setSettingsStatus('Permission to access the knowledge base was denied.', 'error'); return; }
  }

  await chrome.storage.local.set({
    claudeApiKey:       key,
    customInstructions: $('customInstructions').value.trim(),
    agentName:          $('agentName').value.trim(),
    companyName:        $('companyName').value.trim(),
    kbSearchUrl:        kbUrl
  });
  setSettingsStatus('Saved!', 'ok');
  setTimeout(() => setSettingsStatus(''), 2500);
});

$('btnTest').addEventListener('click', async () => {
  const key = $('claudeKey').value.trim();
  if (!key) { setSettingsStatus('Enter API key first.', 'error'); return; }
  setSettingsStatus('Testing...', '');
  $('btnTest').disabled = true;
  const res = await chrome.runtime.sendMessage({ type: 'TEST_API_KEY', key });
  $('btnTest').disabled = false;
  setSettingsStatus(res?.ok ? 'API key valid!' : `Invalid (${res?.status || res?.error || 'unknown'})`, res?.ok ? 'ok' : 'error');
  setTimeout(() => setSettingsStatus(''), 3000);
});

// ── Debug ─────────────────────────────────────────────────────────────────────
function loadDebugLog() {
  chrome.storage.local.get('debugLog', ({ debugLog }) => {
    const el = $('debugLog');
    el.textContent = debugLog?.length ? debugLog.join('\n') : 'No activity yet.';
    el.scrollTop = el.scrollHeight;
  });
}
$('btnCopyLog').addEventListener('click', () => {
  chrome.storage.local.get('debugLog', ({ debugLog }) => {
    navigator.clipboard.writeText((debugLog || []).join('\n')).then(() => {
      $('btnCopyLog').textContent = 'Copied!';
      setTimeout(() => $('btnCopyLog').textContent = 'Copy log', 2000);
    });
  });
});
$('btnClearLog').addEventListener('click', () => {
  chrome.storage.local.set({ debugLog: [] });
  $('debugLog').textContent = 'Cleared.';
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function setStatus(msg, type = '') {
  $('statusBar').textContent = msg;
  $('statusBar').className   = type;
}

function setSettingsStatus(msg, type = '') {
  const el = $('settingsStatus');
  el.textContent  = msg;
  el.style.color  = type === 'ok' ? '#4caf7d' : type === 'error' ? '#e55' : '#888';
}

function setAllBtnsDisabled(disabled) {
  document.querySelectorAll('.action-btn').forEach(b => b.disabled = disabled);
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadSettings();
