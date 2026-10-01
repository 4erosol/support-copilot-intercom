//  Support Copilot for Intercom - Content Script


(function () {
  'use strict';

  // ── Debug logger ──────────────────────────────────────────────────────────────
  // Batches log messages and writes them to storage every 100ms to avoid spamming chrome.storage.local.set (which can be slow).
  let _logQueue = [], _logTimer = null;
  function debugLog(msg) {
    _logQueue.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    clearTimeout(_logTimer);
    _logTimer = setTimeout(() => {
      const batch = _logQueue.splice(0);
      chrome.storage.local.get('debugLog', ({ debugLog }) => {
        const log = (debugLog || []).concat(batch).slice(-100);
        chrome.storage.local.set({ debugLog: log });
      });
    }, 100);
  }

  // ── Shadow-DOM-aware walker ───────────────────────────────────────────────────
  // Intercom uses shadow DOM extensively, so normal querySelector won't work. These helpers walk through both regular DOM and shadow roots to find elements.
  function* walkDOM(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();
    while (node) {
      yield node;
      if (node.shadowRoot) yield* walkDOM(node.shadowRoot);
      node = walker.nextNode();
    }
  }

  function deepQuerySelector(sel, root = document) {
    for (const el of walkDOM(root)) {
      try { if (el.matches(sel)) return el; } catch {}
    }
    return null;
  }

  function deepQuerySelectorAll(sel, root = document) {
    const results = [];
    for (const el of walkDOM(root)) {
      try { if (el.matches(sel)) results.push(el); } catch {}
    }
    return results;
  }

  // ── Extract conversation from Intercom DOM ────────────────────────────────────
  // Parses the Intercom conversation UI and extracts all messages with their roles
  // (customer/agent/bot/system). Also detects whether the conversation is email or
  // chat based on presence of email-specific elements.
  //
  // Intercom periodically renames classes and attributes. This function tries
  // multiple selectors in order so a single rename doesn't break extraction.
  function extractConversation() {
    // ── Step 1: find the conversation stream container ──
    const streamSelectors = [
      '[data-testid="conversation-stream-scroll-container"]',
      '[data-conversation-stream=""]',
      '[data-intercom-target-conversation-stream=""]',
      '.inbox-2__conversation-stream',
      '.inbox2__conversation-stream',
      '[class*="conversation-stream"]',
    ];
    let stream = null;
    for (const sel of streamSelectors) {
      stream = deepQuerySelector(sel, document);
      if (stream) { debugLog(`Stream found via: ${sel}`); break; }
    }
    if (!stream) {
      debugLog('ERROR: No conversation stream found.');
      return null;
    }

    // ── Step 2: find message part elements ──
    // group/content-part = current Tailwind-based class (April 2026 onwards)
    // data-part-group-id = legacy attribute
    const partSelectors = [
      '[class*="group/content-part"]',
      '[data-part-group-id]',
      '[data-part-id]',
      '[data-intercom-part-id]',
      '.inbox-2__conversation-part',
      '.inbox2__conversation-part',
      '[class*="conversation-part"]',
    ];

    let parts = [];
    let usedPartSel = null;
    for (const sel of partSelectors) {
      parts = deepQuerySelectorAll(sel, document);
      if (parts.length > 0) { usedPartSel = sel; break; }
    }
    debugLog(`Part selector: "${usedPartSel || 'none matched'}" → ${parts.length} elements found`);

    const messages  = [];
    let   lastMsgId = null;

    for (const part of parts) {
      const msgId = part.dataset?.partGroupId
                 || part.dataset?.partId
                 || part.dataset?.intercomPartId
                 || part.closest?.('[data-part-entity-id]')?.dataset.partEntityId
                 || null;
      const category = part.dataset?.partGroupCategory || null;
      if (msgId) lastMsgId = msgId;

      // ── Role detection with fallback methods ──
      // Method 1: legacy data-part-group-category attribute
      // 1 = customer, 3 = agent, 5 = bot, 20 = automated
      let role = null;
      if (category === '1')      role = 'customer';
      else if (category === '3') role = 'agent';
      else if (category === '5') role = 'bot';
      else if (category === '20') role = 'system';

      // Method 2: walk up the DOM looking for layout/role hints.
      // Intercom now uses Tailwind utility classes — agent messages typically
      // render right-aligned (justify-end / flex-row-reverse), customer
      // messages render left-aligned (justify-start).
      if (!role) {
        let el = part;
        for (let i = 0; i < 6 && el; i++) {
          const cls = typeof el.className === 'string' ? el.className : '';
          if (cls.includes('justify-end') || cls.includes('flex-row-reverse')) { role = 'agent'; break; }
          if (cls.includes('justify-start')) { role = 'customer'; break; }
          const authorType = el.getAttribute?.('data-author-type') || el.dataset?.authorType;
          if (authorType) {
            const t = authorType.toLowerCase();
            if (t.includes('user') || t.includes('customer')) { role = 'customer'; break; }
            if (t.includes('admin') || t.includes('agent'))   { role = 'agent';    break; }
          }
          el = el.parentElement;
        }
      }

      // Method 3: bubble position. Customer bubbles sit on the left of the stream,
      // agent bubbles on the right. Doesn't depend on class names, so it survives
      // Intercom's Tailwind refactors (as of mid-2026 rows carry no alignment class).
      if (!role) {
        const box = part.getBoundingClientRect();
        const ref = stream.getBoundingClientRect();
        if (box.width > 0 && ref.width > 0) {
          role = (box.left + box.width / 2) > (ref.left + ref.width / 2) ? 'agent' : 'customer';
        }
      }

      // Method 4: default to 'message' so it's still included in context
      if (!role) role = 'message';

      // ── Body text extraction with fallback selectors ──
      const bodySelectors = [
        '.interblocks-html',
        '.inbox-2__break-words',
        '.inbox2__break-words',
        '.inbox-2__user-email-content',
        '.inbox2__user-email-content',
        '.inbox-2__renderable-part',
        '.inbox2__renderable-part',
        '[class*="break-words"]',
        '[class*="content-part"] p',
        'p',
      ];
      let bodyEl = null;
      for (const sel of bodySelectors) {
        bodyEl = deepQuerySelector(sel, part);
        if (bodyEl) break;
      }

      const text = bodyEl?.innerText?.trim() || part.innerText?.trim() || '';
      if (!text) continue;

      messages.push({ role, text, id: msgId });
    }

    // ── Step 3: email vs chat detection ──
    const isEmail = !!deepQuerySelector('.channels__inbox__email-metadata-container', document)
                 || !!deepQuerySelector('.inbox-2__user-email-part', document)
                 || !!deepQuerySelector('.inbox2__user-email-part', document)
                 || !!deepQuerySelector('[class*="email-metadata"]', document);

    // ── Step 4: customer name ──
    const nameSelectors = [
      '[data-inbox-conversation-header-title]',
      '[data-conversation-title]',
      '.inbox-2__conversation-title',
      '.inbox2__conversation-title',
      '[class*="conversation-title"]',
    ];
    let customerName = 'Customer';
    for (const sel of nameSelectors) {
      const el = deepQuerySelector(sel, document);
      if (el?.innerText?.trim()) { customerName = el.innerText.trim(); break; }
    }

    debugLog(`Extracted ${messages.length} messages | type: ${isEmail ? 'email' : 'chat'} | customer: ${customerName}`);

    // Diagnostic dump if nothing extracted — helps identify future Intercom changes
    if (messages.length === 0) {
      const sampleEl = deepQuerySelector('[data-part-group-id], [data-part-id], [class*="conversation-part"]', document);
      debugLog(`DIAG sample part el: ${sampleEl ? sampleEl.tagName + ' class=' + sampleEl.className.slice(0,80) : 'none'}`);
      const allInStream = deepQuerySelectorAll('*', stream);
      const classHints = [...new Set(
        allInStream.slice(0, 200)
          .flatMap(el => [...(el.classList || [])])
          .filter(c => c.includes('part') || c.includes('message') || c.includes('bubble'))
      )].slice(0, 10);
      debugLog(`DIAG class hints: ${classHints.join(', ') || 'none'}`);
    }

    return { messages, lastMsgId, isEmail, customerName };
  }

  // ── Inject text into Intercom compose box ────────────────────────────────────
  // Finds the Intercom compose box (a ProseMirror / TipTap editor) and injects our draft text into it.
  // Preferred path: a synthetic paste, which goes through the editor's own input pipeline so its
  // internal state stays in sync. Fallback: write <p> elements directly into the editable DOM.
  function injectText(text) {
    const box = deepQuerySelector('[data-conversation-reply-composer] .ProseMirror[contenteditable="true"]', document)
             || deepQuerySelector('.ProseMirror.embercom-prosemirror-composer-editor', document)
             || deepQuerySelector('.embercom-prosemirror-composer-editor', document)
             || deepQuerySelector('.ProseMirror[contenteditable="true"]', document);

    if (!box) {
      debugLog('ERROR: Compose box not found for injection.');
      return false;
    }

    box.focus();
    document.execCommand('selectAll');

    try {
      const dt = new DataTransfer();
      dt.setData('text/plain', text);
      box.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      const firstLine = text.split('\n').find(l => l.trim())?.trim() || '';
      if (firstLine && box.innerText.includes(firstLine.slice(0, 40))) {
        debugLog('Text injected into compose box (paste).');
        return true;
      }
      debugLog('Paste injection did not take, falling back to DOM write.');
    } catch (err) {
      debugLog(`Paste injection failed (${err.message}), falling back to DOM write.`);
    }

    box.innerHTML = '';

    // Split into paragraphs and insert each as a <p> so Intercom renders line breaks properly
    const lines = text.split('\n');
    for (const line of lines) {
      const p = document.createElement('p');
      p.textContent = line || '\u00A0'; // non-breaking space for empty lines
      box.appendChild(p);
    }

    // Trigger events so Intercom's editor picks up the change and enables the send button
    ['input', 'keyup', 'change'].forEach(e =>
      box.dispatchEvent(new Event(e, { bubbles: true }))
    );

    debugLog('Text injected into compose box (DOM write).');
    return true;
  }

  // ── Message handler from background/popup ────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'GET_CONVERSATION') {
      const data = extractConversation();
      if (!data) {
        debugLog('GET_CONVERSATION: no conversation found in DOM.');
        sendResponse({ error: 'No conversation found. Make sure a conversation is open in Intercom.' });
      } else {
        sendResponse({ ok: true, ...data });
      }
      return true;
    }

    if (msg.type === 'INJECT_TEXT') {
      const ok = injectText(msg.text);
      sendResponse({ ok });
      return true;
    }
  });

  debugLog(`Content script loaded. URL: ${location.href}`);
})();
