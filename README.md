# JupyterLab Inline Kernel Completer

This JupyterLab 4 extension provides lightweight ghost-text completions from the active Jupyter kernel.

## How it works

As you type, the extension sends the current cell text and cursor position to the active kernel using the Jupyter completion protocol. It displays the suffixes returned by the kernel as inline suggestions. The regular JupyterLab completion popup remains available through its normal shortcut (usually `Ctrl+Space`).

The extension uses only the active kernel. It does not use AI, a remote service, telemetry, or completion history.

## Requirements

- JupyterLab 4.x
- A running Jupyter kernel that supports the `complete_request` protocol

## Installation

For development from a checkout:

```bash
yarn install
yarn build
jupyter labextension develop . --overwrite
```

To use the built extension locally without publishing it:

```bash
jupyter labextension install .
```

The package is also structured as a prebuilt JupyterLab extension and can be installed by a package manager once published. This repository does not publish to npm or PyPI as part of its development workflow.

## Configuration

The provider exposes settings through JupyterLab's inline-completion provider configuration: enabled state, timeout, debounce delay, maximum suggestions, minimum prefix length, and whether to fill in the middle of a line. The defaults are conservative: a 2-second kernel timeout, a two-character prefix, and at most five suggestions.

## Limitations

- Suggestions depend on the active kernel and its language implementation.
- A kernel that is stopped, unavailable, slow, or does not support completion produces no ghost text.
- The extension does not generate completions itself and does not retain history.
- It provides no Python server package; installation requires Node/JupyterLab extension tooling until a distribution package is published.

## Development

```bash
yarn typecheck
yarn build
```

The project is released under the MIT License.
