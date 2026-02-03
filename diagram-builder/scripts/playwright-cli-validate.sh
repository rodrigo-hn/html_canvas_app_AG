#!/usr/bin/env bash
set -euo pipefail

SESSION="diagram-validate"
URL="${1:-http://127.0.0.1:4200/}"

pw() {
  playwright-cli --session "$SESSION" "$@"
}

pw open "$URL" > /dev/null

# Wait for the Export button to exist
pw eval "() => !!Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Export HTML')" | grep -q true

# Helper JS snippets for reuse
SET_INPUT_BY_LABEL="(labelText, value) => {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find(l => l.textContent?.trim() === labelText);
  if (!label) return false;
  const input = label.parentElement?.querySelector('input, textarea, select');
  if (!input) return false;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}"

CLICK_NODE_BY_TEXT="(text, shiftKey) => {
  const nodes = Array.from(document.querySelectorAll('[appdraggable]'));
  const node = nodes.find(n => n.innerText.includes(text));
  if (!node) return false;
  node.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: !!shiftKey }));
  return true;
}"

DRAG_NODE_BY_TEXT="(text, dx, dy) => {
  const nodes = Array.from(document.querySelectorAll('[appdraggable]'));
  const node = nodes.find(n => n.innerText.includes(text));
  if (!node) return false;
  const rect = node.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: startX, clientY: startY }));
  document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: startX + dx, clientY: startY + dy }));
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: startX + dx, clientY: startY + dy }));
  return true;
}"

GET_NODE_STYLE_BY_TEXT="(text) => {
  const nodes = Array.from(document.querySelectorAll('[appdraggable]'));
  const node = nodes.find(n => n.innerText.includes(text));
  if (!node) return null;
  const style = getComputedStyle(node);
  return { left: style.left, top: style.top, className: node.className };
}"

# 1) Inspector edit for shape node
pw eval "() => ($CLICK_NODE_BY_TEXT)('Start Process', false)" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('X', '140')" > /dev/null
pw eval "() => ($GET_NODE_STYLE_BY_TEXT)('Start Process')" | grep -q '"left": "140px"'

# 2) Multi-select + multi-drag
pw eval "() => ($CLICK_NODE_BY_TEXT)('Start Process', false)" > /dev/null
pw eval "() => ($CLICK_NODE_BY_TEXT)('Database', true)" > /dev/null
pw eval "() => ($DRAG_NODE_BY_TEXT)('Start Process', 40, 20)" > /dev/null
pw eval "() => ({ start: ($GET_NODE_STYLE_BY_TEXT)('Start Process'), db: ($GET_NODE_STYLE_BY_TEXT)('Database') })" | grep -q '"left": "180px"'
pw eval "() => ({ start: ($GET_NODE_STYLE_BY_TEXT)('Start Process'), db: ($GET_NODE_STYLE_BY_TEXT)('Database') })" | grep -q '"left": "340px"'

# 3) Edit web-component button
pw eval "() => ($CLICK_NODE_BY_TEXT)('Save', false)" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Text', 'Guardar')" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Variant', 'danger')" > /dev/null
pw eval "() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Guardar');
  if (!btn) return false;
  return btn.className.includes('bg-red-500');
}" | grep -q true

# 4) Edit web-component card
pw eval "() => ($CLICK_NODE_BY_TEXT)('User Profile', false)" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Title', 'Perfil')" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Content', 'Contenido actualizado')" > /dev/null
pw eval "() => {
  const card = Array.from(document.querySelectorAll('[appdraggable]')).find(n => n.innerText.includes('Perfil'));
  if (!card) return false;
  return card.innerText.includes('Contenido actualizado');
}" | grep -q true

# 5) Export HTML includes edges
pw eval "() => { window.__lastExport = null; const orig = URL.createObjectURL; URL.createObjectURL = (blob) => { blob.text().then(t => { window.__lastExport = t; }); return 'blob:mock'; }; return true; }" > /dev/null
pw eval "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Export HTML'); if (btn) btn.click(); return true; }" > /dev/null
pw eval "async () => { await new Promise(r => setTimeout(r, 100)); return { hasExport: !!window.__lastExport, hasPath: window.__lastExport?.includes('<path') || false, hasMarker: window.__lastExport?.includes('marker') || false }; }" | grep -q '"hasPath": true'

pw close > /dev/null

echo "Playwright CLI validation passed."
