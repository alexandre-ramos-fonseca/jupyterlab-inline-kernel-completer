# JupyterLab Inline Kernel Completer

A lightweight JupyterLab inline-completion provider that displays ghost-text suggestions returned by the active Jupyter kernel.

It uses the standard Jupyter completion protocol only. It does **not** use AI, a remote service, telemetry, or completion history.

## How it works

As you type, the extension sends the current editor text and cursor position to the active kernel using `complete_request`. Matching suffixes returned by the kernel are displayed as inline suggestions.

The regular JupyterLab completion popup remains available through its normal shortcuts.

## Requirements

- JupyterLab 4.5.x (the current package dependencies target the JupyterLab 4.5 series);
- a running Jupyter kernel that supports the `complete_request` protocol;
- Node.js when installing from source.

## Quick start from source

Until the extension is published to a package registry, install it from a checkout:

```sh
git clone https://github.com/alexandre-ramos-fonseca/jupyterlab-inline-kernel-completer.git
cd jupyterlab-inline-kernel-completer
corepack enable
yarn install --immutable
yarn build
jupyter labextension develop . --overwrite
```

Restart JupyterLab, then confirm that the extension is visible:

```sh
jupyter labextension list
```

## Using the completer

Open a notebook with an active kernel and start typing a symbol that the kernel can complete. When a suggestion is available, JupyterLab displays the remaining text as ghost text.

JupyterLab's default inline-completion shortcuts include:

- `Tab` or `Alt+End` — accept the current suggestion;
- `Alt+[` / `Alt+]` — cycle through suggestions;
- `Alt+\` — request an inline suggestion explicitly.

These shortcuts belong to JupyterLab and can be changed in its settings.

## Configuration

Open **Settings → Settings Editor → Inline Completer**. The installed provider appears as **Kernel Inline Completer** / **Kernel**.

The provider exposes:

- **Enabled** — enable or disable kernel ghost-text suggestions;
- **Timeout** — maximum wait for a kernel reply, default `2000 ms`;
- **Debounce delay** — delay before requesting a suggestion, default `120 ms`;
- **Max suggestions** — maximum candidates returned to the inline completer, default `5`;
- **Min prefix length** — minimum typed prefix before suggestions are shown, default `2`;
- **Auto-fill in middle** — allow automatic suggestions when typing in the middle of a line, disabled by default.

JupyterLab also provides global Inline Completer settings for ghost-text appearance, suggestion widgets, shortcuts, and related behavior.

## Troubleshooting

If no ghost text appears:

1. confirm that the notebook has a running kernel;
2. check **Settings → Settings Editor → Inline Completer** and ensure the Kernel provider is enabled;
3. try `Alt+\` to request a suggestion explicitly;
4. verify that the kernel itself offers completions, for example with the regular JupyterLab completer;
5. check `jupyter labextension list` to confirm that the extension is loaded.

A kernel that is stopped, slow, unavailable, or does not implement useful completions will produce no ghost text.

## Development

```sh
corepack enable
yarn install --immutable
yarn typecheck
yarn build
```

The project is a JavaScript-only JupyterLab extension and is not currently published to npm or PyPI.

## Privacy and limitations

- Suggestions come exclusively from the active kernel.
- The extension does not generate completions itself.
- It does not retain completion history.
- It does not send code to an external service.
- Completion quality depends entirely on the active kernel and language implementation.

## License

MIT. See [LICENSE](LICENSE).
