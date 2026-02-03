#!/usr/bin/env bash
set -euo pipefail

SESSION="diagram-validate"
URL="${1:-http://127.0.0.1:4200/}"

pw() {
  playwright-cli --session "$SESSION" "$@"
}

wait_for() {
  local expr="$1"
  local expected="$2"
  local attempts=15
  for i in $(seq 1 $attempts); do
    if pw eval "$expr" | grep -q "$expected"; then
      return 0
    fi
    sleep 0.3
  done
  echo "Wait condition failed: $expected" >&2
  return 1
}

pw open "$URL" > /dev/null

# Wait for the Export button to exist (up to 20s)
for i in {1..20}; do
  if pw eval "() => !!Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Export HTML')" | grep -q true; then
    break
  fi
  sleep 1
  if [ "$i" -eq 20 ]; then
    echo "Export button not found after waiting." >&2
    exit 1
  fi
  pw reload > /dev/null || true
  sleep 1
  continue

done

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

SET_SELECT_BY_LABEL="(labelText, value) => {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find(l => l.textContent?.trim() === labelText);
  if (!label) return false;
  const select = label.parentElement?.querySelector('select');
  if (!select) return false;
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}"

GET_FIELD_VALUE_BY_LABEL="(labelText) => {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find(l => l.textContent?.trim() === labelText);
  if (!label) return null;
  const input = label.parentElement?.querySelector('input, textarea, select');
  if (!input) return null;
  return input.value;
}"

CLICK_NODE_BY_TEXT="(text, shiftKey) => {
  const nodes = Array.from(document.querySelectorAll('[appdraggable]'));
  const node = nodes.find(n => n.innerText.includes(text));
  if (!node) return false;
  node.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: !!shiftKey }));
  return true;
}"

DBLCLICK_NODE_BY_TEXT="(text) => {
  const nodes = Array.from(document.querySelectorAll('[appdraggable]'));
  const node = nodes.find(n => n.innerText.includes(text));
  if (!node) return false;
  node.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
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
wait_for "() => ($GET_NODE_STYLE_BY_TEXT)('Start Process')" '"left": "140px"'

# 2) Multi-select + multi-drag
pw eval "() => ($CLICK_NODE_BY_TEXT)('Start Process', false)" > /dev/null
pw eval "() => ($CLICK_NODE_BY_TEXT)('Database', true)" > /dev/null
pw eval "() => ($DRAG_NODE_BY_TEXT)('Start Process', 40, 20)" > /dev/null
wait_for "() => ({ start: ($GET_NODE_STYLE_BY_TEXT)('Start Process'), db: ($GET_NODE_STYLE_BY_TEXT)('Database') })" '"left": "180px"'
wait_for "() => ({ start: ($GET_NODE_STYLE_BY_TEXT)('Start Process'), db: ($GET_NODE_STYLE_BY_TEXT)('Database') })" '"left": "340px"'

# 3) Edit web-component button via inspector
pw eval "() => ($CLICK_NODE_BY_TEXT)('Save', false)" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Text', 'Guardar')" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Variant', 'danger')" > /dev/null
wait_for "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Guardar'); return !!btn && btn.className.includes('bg-red-500'); }" true

# 4) Edit web-component card via inspector
pw eval "() => ($CLICK_NODE_BY_TEXT)('User Profile', false)" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Title', 'Perfil')" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('Content', 'Contenido actualizado')" > /dev/null
wait_for "() => { const card = Array.from(document.querySelectorAll('[appdraggable]')).find(n => n.innerText.includes('Perfil')); return !!card && card.innerText.includes('Contenido actualizado'); }" true

# 5) Inline edit (double click) for shape text
pw eval "() => ($CLICK_NODE_BY_TEXT)('Start Process', false)" > /dev/null
pw eval "() => ($DBLCLICK_NODE_BY_TEXT)('Start Process')" > /dev/null
pw eval "() => { const input = Array.from(document.querySelectorAll('[appdraggable] input')).find(i => i.value !== undefined); if (!input) return false; input.value = 'Proceso'; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('blur', { bubbles: true })); return true; }" > /dev/null
wait_for "() => !!Array.from(document.querySelectorAll('[appdraggable]')).find(n => n.innerText.includes('Proceso'))" true

# 6) Snap-to-grid toggle + grid size
wait_for "() => { const checkbox = document.querySelector('input[type=checkbox]'); if (!checkbox) return false; checkbox.click(); return checkbox.checked; }" false
wait_for "() => { const checkbox = document.querySelector('input[type=checkbox]'); if (!checkbox) return false; if (!checkbox.checked) checkbox.click(); return checkbox.checked; }" true
pw eval "() => { const input = document.querySelector('input[type=number]'); if (!input) return false; input.value = '30'; input.dispatchEvent(new Event('change', { bubbles: true })); return true; }" > /dev/null
wait_for "() => { const grid = document.querySelector('.absolute.inset-0.pointer-events-none'); if (!grid) return false; return getComputedStyle(grid).backgroundSize.includes('30px'); }" true

# 7) Inspector selects for shapeType/componentType
pw eval "() => ($CLICK_NODE_BY_TEXT)('Proceso', false)" > /dev/null
pw eval "() => ($SET_SELECT_BY_LABEL)('Shape Type', 'diamond')" > /dev/null
wait_for "() => ($GET_FIELD_VALUE_BY_LABEL)('Shape Type')" diamond

pw eval "() => ($CLICK_NODE_BY_TEXT)('Guardar', false)" > /dev/null
pw eval "() => ($SET_SELECT_BY_LABEL)('Component Type', 'input')" > /dev/null
wait_for "() => ($GET_FIELD_VALUE_BY_LABEL)('Component Type')" input

# 8) Validation: numbers clamp to >= 0
pw eval "() => ($CLICK_NODE_BY_TEXT)('Proceso', false)" > /dev/null
pw eval "() => ($SET_INPUT_BY_LABEL)('X', '-10')" > /dev/null
wait_for "() => ($GET_FIELD_VALUE_BY_LABEL)('X')" '0'

# 9) Export HTML includes edges
pw eval "() => { window.__lastExport = null; const orig = URL.createObjectURL; URL.createObjectURL = (blob) => { blob.text().then(t => { window.__lastExport = t; }); return 'blob:mock'; }; return true; }" > /dev/null
pw eval "() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Export HTML'); if (btn) btn.click(); return true; }" > /dev/null
wait_for "async () => { await new Promise(r => setTimeout(r, 100)); return { hasExport: !!window.__lastExport, hasPath: window.__lastExport?.includes('<path') || false, hasMarker: window.__lastExport?.includes('marker') || false }; }" '"hasPath": true'

pw close > /dev/null

echo "Playwright CLI validation passed."
