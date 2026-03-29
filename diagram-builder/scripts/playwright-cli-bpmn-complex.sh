#!/usr/bin/env bash
set -euo pipefail

SESSION="diagram-bpmn-complex-$$"
URL="${1:-http://127.0.0.1:5200/}"

pw() {
  playwright-cli --session "$SESSION" "$@"
}

wait_for() {
  local expr="$1"
  local expected="$2"
  local attempts=30
  for i in $(seq 1 "$attempts"); do
    if pw eval "$expr" | grep -q "$expected"; then
      return 0
    fi
    sleep 0.5
  done
  echo "Wait condition failed: $expected" >&2
  return 1
}

pw open "$URL" > /dev/null

wait_for "() => !!Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Export HTML')" true

# Validate complex BPMN content exists in canvas
wait_for "() => {
  const nodes = Array.from(document.querySelectorAll('[appdraggable]'));
  const hasPool = nodes.some(n => n.textContent?.includes('PIZZERIA LA ITALIANA'));
  const hasLane = nodes.some(n => n.textContent?.includes('Atencion al Cliente'));
  const hasTasks = nodes.filter(n => n.textContent?.includes('pedido')).length >= 2;
  return hasPool && hasLane && hasTasks;
}" true

# Validate edge layer density for complex diagram
wait_for "() => {
  const edges = document.querySelectorAll('app-edges-layer svg path.pointer-events-auto');
  return edges.length >= 8;
}" true

# Validate export includes edge markers and BPMN web task render blocks
pw eval "() => {
  window.__lastExport = '';
  const original = URL.createObjectURL;
  URL.createObjectURL = (blob) => {
    blob.text().then((t) => {
      window.__lastExport = t;
    });
    return 'blob:mock';
  };
  const button = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Export HTML');
  button?.click();
  window.__restoreCreateObjectUrl = () => {
    URL.createObjectURL = original;
  };
  return !!button;
}" > /dev/null

wait_for "async () => {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return window.__lastExport.includes('marker') &&
    window.__lastExport.includes('Notificar cliente') &&
    window.__lastExport.includes('PIZZERIA LA ITALIANA');
}" true

pw eval "() => {
  if (typeof window.__restoreCreateObjectUrl === 'function') {
    window.__restoreCreateObjectUrl();
  }
  return true;
}" > /dev/null

pw close > /dev/null || true
playwright-cli session-stop "$SESSION" >/dev/null 2>&1 || true
playwright-cli session-delete "$SESSION" >/dev/null 2>&1 || true

echo "Playwright CLI BPMN complex validation passed."
