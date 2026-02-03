# Playwright CLI validation

This project uses `playwright-cli` (https://github.com/microsoft/playwright-cli) to validate the UI features we added.

## Prerequisites
- The dev server must be running at `http://127.0.0.1:4200/`.
- `playwright-cli` must be installed and on PATH.

## Run the validation script

```bash
scripts/playwright-cli-validate.sh
```

If the app runs on a different URL, pass it as the first argument:

```bash
scripts/playwright-cli-validate.sh http://127.0.0.1:4201/
```

## What it validates
- Inspector edits for shape nodes (position update).
- Multi-select and multi-drag behavior.
- Web-component editing (button text + variant, card title + content).
- Export HTML includes edge paths and marker definitions.
