// Cline 桌面端中文汉化注入器 (WebView2 CDP)
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.CDP_PORT || 9333;
const DICT_PATH = path.join(__dirname, 'dictionary.json');

function buildPayload() {
  const DICT = JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'));
  return "(() => {" +
    "const DICT = " + JSON.stringify(DICT) + ";" +
    "const textRes = (DICT.textPatterns || []).map(([p, r, f]) => [new RegExp(p, f), r]);" +
    "const attrRes = (DICT.attrPatterns || []).map(([p, r, f]) => [new RegExp(p, f), r]);" +
    "const wholeEls = DICT.wholeElements || {};" +
    "const apply = () => {" +
    "  try {" +
    "    let replaced = 0;" +
    "    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);" +
    "    let n;" +
    "    while (n = walker.nextNode()) {" +
    "      const parent = n.parentElement;" +
    "      if (!parent || parent.closest('pre, code, script, style, textarea, input, [contenteditable=\"true\"]')) continue;" +
    "      const raw = n.textContent;" +
    "      const t = raw.trim();" +
    "      if (!t || t.length > 600 || t.length < 1) continue;" +
    "      const norm = t.replace(/\\s+/g, ' ');" +
    "      if (DICT.texts[t] !== undefined) {" +
    "        if (n.nodeValue.trim() !== DICT.texts[t]) { n.nodeValue = DICT.texts[t]; replaced++; }" +
    "        continue;" +
    "      }" +
    "      if (DICT.texts[norm] !== undefined) {" +
    "        if (n.nodeValue.trim() !== DICT.texts[norm]) { n.nodeValue = DICT.texts[norm]; replaced++; }" +
    "        continue;" +
    "      }" +
    "      let matched = false;" +
    "      for (let i = 0; i < textRes.length; i++) {" +
    "        if (textRes[i][0].test(norm)) {" +
    "          const v = norm.replace(textRes[i][0], textRes[i][1]);" +
    "          if (n.nodeValue !== v) { n.nodeValue = v; replaced++; }" +
    "          matched = true; break;" +
    "        }" +
    "      }" +
    "      if (matched) continue;" +
    "    }" +
    "    document.querySelectorAll('body *').forEach(el => {" +
    "      if (el.children.length > 0) return;" +
    "      const full = el.textContent.trim().replace(/\\s+/g, ' ');" +
    "      if (wholeEls[full] !== undefined && el.textContent !== wholeEls[full]) {" +
    "        el.textContent = wholeEls[full]; replaced++;" +
    "      }" +
    "    });" +
    "    const ATTR_NAMES = ['placeholder','aria-label','title','alt','searchPlaceholder','emptyText'];" +
    "    document.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(el => {" +
    "      ATTR_NAMES.forEach(a => {" +
    "        const v = el.getAttribute(a);" +
    "        if (!v) return;" +
    "        const normV = v.trim().replace(/\\s+/g, ' ');" +
    "        if (DICT.attrs[v] !== undefined) {" +
    "          if (el.getAttribute(a) !== DICT.attrs[v]) { el.setAttribute(a, DICT.attrs[v]); replaced++; }" +
    "          return;" +
    "        }" +
    "        if (DICT.attrs[normV] !== undefined) {" +
    "          if (el.getAttribute(a) !== DICT.attrs[normV]) { el.setAttribute(a, DICT.attrs[normV]); replaced++; }" +
    "          return;" +
    "        }" +
    "        if (DICT.texts[v] !== undefined) {" +
    "          if (el.getAttribute(a) !== DICT.texts[v]) { el.setAttribute(a, DICT.texts[v]); replaced++; }" +
    "          return;" +
    "        }" +
    "        if (DICT.texts[normV] !== undefined) {" +
    "          if (el.getAttribute(a) !== DICT.texts[normV]) { el.setAttribute(a, DICT.texts[normV]); replaced++; }" +
    "          return;" +
    "        }" +
    "        for (let i = 0; i < attrRes.length; i++) {" +
    "          if (attrRes[i][0].test(normV)) {" +
    "            const nextV = normV.replace(attrRes[i][0], attrRes[i][1]);" +
    "            if (el.getAttribute(a) !== nextV) { el.setAttribute(a, nextV); replaced++; }" +
    "            break;" +
    "          }" +
    "        }" +
    "      });" +
    "    });" +
    "    if (document.title === 'Cline') document.title = 'Cline 中文版';" +
    "    return 'replaced:' + replaced;" +
    "  } catch (e) { return 'ERR:' + e.message; }" +
    "};" +
    "const res = apply();" +
    "if (!window.__clineZhInstalled) {" +
    "  if (window.__clineZhObs) { try { window.__clineZhObs.disconnect(); } catch (e) {} }" +
    "  if (window.__clineZhTimer) { clearInterval(window.__clineZhTimer); }" +
    "  const mo = new MutationObserver(() => { clearTimeout(window.__clineZhDbt); window.__clineZhDbt = setTimeout(apply, 200); });" +
    "  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label','placeholder','title','alt'] });" +
    "  window.__clineZhObs = mo;" +
    "  window.__clineZhTimer = setInterval(apply, 1500);" +
    "  window.__clineZhInstalled = true;" +
    "}" +
    "return res;" +
    "})()";
}

function fetchJson(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      if (res.statusCode !== 200) { resolve([]); return; }
      let d = ''; res.on('data', (c) => d += c);
      res.on('end', () => {
        try {
          const list = JSON.parse(d);
          if (Array.isArray(list)) resolve(list);
          else resolve([]);
        } catch (e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function getTargets() {
  let targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
  const hasPage = targets.some(t => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!hasPage) {
    const ipv6Targets = await fetchJson(`http://[::1]:${PORT}/json`);
    if (ipv6Targets.some(t => t.type === 'page' && t.webSocketDebuggerUrl)) {
      targets = ipv6Targets;
    }
  }
  return targets;
}

function injectOnce(wsUrl, payload) {
  return new Promise((resolve) => {
    let ws;
    try { ws = new WebSocket(wsUrl); } catch (e) { resolve('wserr'); return; }
    const timer = setTimeout(() => { try { ws.close(); } catch (e) {} resolve('timeout'); }, 8000);
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: payload, returnByValue: true } }));
    };
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        if (m.id === 1) {
          const v = m.result && m.result.result && m.result.result.value;
          clearTimeout(timer); ws.close();
          resolve(v || 'no-return');
        }
      } catch (err) { }
    };
    ws.onerror = () => { clearTimeout(timer); try { ws.close(); } catch (e) {} resolve('wserror'); };
    ws.onclose = () => { clearTimeout(timer); resolve('wsclosed'); };
  });
}

async function loop() {
  let lastLog = 0;
  let missingCount = 0;
  while (true) {
    const payload = buildPayload();
    const targets = await getTargets();
    const page = targets.find(t => t.type === 'page');
    if (page && page.webSocketDebuggerUrl) {
      missingCount = 0;
      const r = await injectOnce(page.webSocketDebuggerUrl, payload);
      const now = Date.now();
      if (now - lastLog > 10000) {
        if (!process.env.SILENT) {
          console.log('[cline-zh] ' + new Date().toLocaleTimeString() + ' apply: ' + r);
        }
        lastLog = now;
      }
    } else {
      missingCount++;
      // 当 Cline 客户端关闭且 15 秒内未连接时，自动退出
      if (missingCount >= 5 && lastLog > 0) {
        process.exit(0);
      }
    }
    await new Promise(r => setTimeout(r, 3000));
  }
}

console.log('[cline-zh] Cline 汉化注入器已启动 (端口: ' + PORT + ')');
loop().catch(e => { console.error(e); process.exit(1); });
