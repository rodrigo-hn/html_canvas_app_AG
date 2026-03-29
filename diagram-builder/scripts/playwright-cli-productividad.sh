#!/usr/bin/env bash
set -euo pipefail

SESSION="diagram-productividad"
URL="${1:-http://127.0.0.1:5200/}"

pw() {
  playwright-cli --session "$SESSION" "$@"
}

wait_for() {
  local expr="$1"
  local expected="$2"
  local attempts=30
  for _ in $(seq 1 "$attempts"); do
    if pw eval "$expr" | grep -q "$expected"; then
      return 0
    fi
    sleep 0.4
  done
  echo "Wait condition failed: $expected" >&2
  return 1
}

pw open "$URL" >/dev/null
wait_for "() => !!Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Undo')" true

# Seleccionar nodo y mover con flecha
pw eval "() => {
  const node = Array.from(document.querySelectorAll('[appdraggable]')).find(n => n.textContent?.includes('Registrar pedido'));
  if (!node) return false;
  const before = getComputedStyle(node).left;
  window.__beforeLeft = before;
  node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  const after = getComputedStyle(node).left;
  window.__afterLeft = after;
  return before !== after;
}" >/dev/null

# Undo/Redo por shortcuts
pw eval "() => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
  const node = Array.from(document.querySelectorAll('[appdraggable]')).find(n => n.textContent?.includes('Registrar pedido'));
  if (!node) return false;
  window.__undoLeft = getComputedStyle(node).left;
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }));
  window.__redoLeft = getComputedStyle(node).left;
  return true;
}" >/dev/null

wait_for "() => window.__beforeLeft === window.__undoLeft" true
wait_for "() => window.__afterLeft === window.__redoLeft" true

pw close >/dev/null || true
playwright-cli session-stop "$SESSION" >/dev/null 2>&1 || true
playwright-cli session-delete "$SESSION" >/dev/null 2>&1 || true

echo "Playwright CLI productividad validation passed."
