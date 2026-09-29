# AGENTS.md

## Cursor Cloud specific instructions

OpenWorker is a local-first AI "coworker" desktop app. The components that matter for dev are the
Python agent backend (`coworker/`), the React+Vite GUI (`surfaces/gui/`), and a Tauri/Rust desktop
shell + Rust STT sidecar (`surfaces/gui/src-tauri/`, `stt/`). For cloud dev you run the backend
server plus the browser GUI (Vite); the Tauri desktop shell and STT sidecar are not needed and their
Rust build is out of scope.

Standard commands live in `README.md` and `.github/workflows/ci.yml`; don't duplicate them here.
Key non-obvious notes:

### Dependencies / setup
- The Python backend installs into a `.venv/` at the repo root (git-ignored). The startup update
  script recreates/refreshes it (`pip install -e ".[messaging,dev,bedrock]"`) and runs
  `npm --prefix surfaces/gui ci`. Use `.venv/bin/openworker-server`, `.venv/bin/pytest`, etc.
- `aisuite` is pinned to a **git commit** in `pyproject.toml`, so `pip install` needs network access.
- `python3-venv` (apt) must be present for venv creation; it is part of the base image.
- E2E tests need the Playwright Chromium browser. It is not installed by the update script — run
  `npx playwright install chromium` (add `--with-deps` for a fresh machine) from `surfaces/gui/`
  before `npm run e2e`.

### Running the services (dev)
- Backend: `.venv/bin/openworker-server --cwd <some/project/dir> --port 8765` (default port 8765).
  It writes a per-launch auth token to `~/.config/coworker/sidecar-8765.token`; API calls need
  header `X-OpenWorker-Token: <token>`. Health check: `GET /v1/health`.
- GUI: `cd surfaces/gui && npm run dev` — Vite serves on **port 1420** (fixed, `strictPort`). Vite
  reads the sidecar token file at startup, so start the backend first. Open `http://localhost:1420/`.

### Using a model (core functionality)
- The agent needs a model provider. With no cloud key, the simplest path is local **Ollama**:
  install Ollama, run `ollama serve` (listens on `127.0.0.1:11434`), and `ollama pull <model>`.
  A small model like `llama3.2:3b` gives coherent answers; `llama3.2:1b` is faster but often rambles
  on the agentic system prompt.
- Configure it in the app: Settings → Models → "Ollama (local models)" (no API key; default URL
  `http://localhost:11434`), add the model id (e.g. `llama3.2:3b`) and click "Make default". Then
  send a message in a session. Provider/model choice persists in `~/.config/coworker/config.toml`.

### Testing gotchas
- The e2e spec `e2e/nav-collapse.spec.ts` test "⌘B toggles the sidebar collapse" is timing-flaky: it
  presses the shortcut before the app leaves its `boot-splash` state, so it can fail while the rest of
  the ~150-test suite passes. It is not an environment problem.
- When recording the browser, the app may show a brief full-screen "spinning cube" boot-splash frame
  during send/reconnect; it recovers to show the reply. It is transient, not a crash.
