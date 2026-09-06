import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import {
  CompletionHandler,
  ICompletionProviderManager,
  IInlineCompletionContext,
  IInlineCompletionItem,
  IInlineCompletionList,
  IInlineCompletionProvider,
} from '@jupyterlab/completer';

import { KernelMessage } from '@jupyterlab/services';

import { Text } from '@jupyterlab/coreutils';

interface IKernelCompleterConfig {
  enabled: boolean;
  autoFillInMiddle: boolean;
  timeout: number;
  debouncerDelay: number;
  maxSuggestions: number;
  minPrefixLength: number;
}

const DEFAULT_CONFIG: IKernelCompleterConfig = {
  enabled: true,
  autoFillInMiddle: false,
  timeout: 2000,
  debouncerDelay: 120,
  maxSuggestions: 5,
  minPrefixLength: 2,
};

function buildSuffixes(
  fullText: string,
  cursorOffsetJs: number,
  response: KernelMessage.ICompleteReplyMsg['content'],
  maxSuggestions: number,
  minPrefixLength: number
): IInlineCompletionItem[] {
  if (response.status !== 'ok') {
    return [];
  }

  const cursorStartJs = Text.charIndexToJsIndex(response.cursor_start, fullText);
  const segment = fullText.slice(cursorStartJs, cursorOffsetJs).trim();

  if (segment.length < minPrefixLength) {
    return [];
  }

  const items: IInlineCompletionItem[] = [];
  const typesExperimental = (response.metadata as Record<string, unknown> | undefined)
    ?._jupyter_types_experimental as Array<{ text?: string }> | undefined;

  for (let i = 0; i < response.matches.length && items.length < maxSuggestions; i++) {
    const completionText: string =
      typesExperimental?.[i]?.text ?? response.matches[i];

    if (typeof completionText !== 'string' || !completionText.startsWith(segment)) {
      continue;
    }

    const suffix = completionText.slice(segment.length);
    if (suffix) {
      items.push({ insertText: suffix });
    }
  }

  return items;
}

/** Inline completions supplied exclusively by the active Jupyter kernel. */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-inline-kernel-completer:kernel',
  description: 'Inline kernel completer with ghost text (no AI, no history).',
  autoStart: true,
  requires: [ICompletionProviderManager],

  activate(
    _app: JupyterFrontEnd,
    providerManager: ICompletionProviderManager
  ): void {
    let config = { ...DEFAULT_CONFIG };

    const provider: IInlineCompletionProvider = {
      name: 'Kernel',
      identifier: 'jupyterlab-inline-kernel-completer:kernel',

      schema: {
        title: 'Kernel Inline Completer',
        description: 'Ghost-text completions from the kernel (no AI, no history).',
        properties: {
          enabled: { title: 'Enabled', type: 'boolean', default: true },
          autoFillInMiddle: {
            title: 'Auto-fill in middle',
            type: 'boolean',
            default: DEFAULT_CONFIG.autoFillInMiddle,
          },
          timeout: {
            title: 'Timeout (ms)',
            type: 'number',
            default: DEFAULT_CONFIG.timeout,
          },
          debouncerDelay: {
            title: 'Debounce delay (ms)',
            type: 'number',
            default: DEFAULT_CONFIG.debouncerDelay,
          },
          maxSuggestions: {
            title: 'Max suggestions',
            type: 'number',
            default: DEFAULT_CONFIG.maxSuggestions,
          },
          minPrefixLength: {
            title: 'Min prefix length',
            type: 'number',
            default: DEFAULT_CONFIG.minPrefixLength,
          },
        },
      },

      configure(settings: Record<string, unknown>): void {
        for (const key of Object.keys(DEFAULT_CONFIG) as Array<keyof IKernelCompleterConfig>) {
          const value = settings[key];
          if (value !== undefined && typeof value === typeof DEFAULT_CONFIG[key]) {
            (config as Record<string, unknown>)[key] = value;
          }
        }
      },

      async fetch(
        request: CompletionHandler.IRequest,
        context: IInlineCompletionContext
      ): Promise<IInlineCompletionList> {
        if (!config.enabled) {
          return { items: [] };
        }

        const kernel = context.session?.kernel;
        if (!kernel) {
          return { items: [] };
        }

        const fullText = request.text;
        const cursorOffsetJs = request.offset;
        const cursorPosChar = Text.jsIndexToCharIndex(cursorOffsetJs, fullText);

        let reply: KernelMessage.ICompleteReplyMsg['content'] | null = null;
        try {
          const requestPromise = kernel.requestComplete({
            code: fullText,
            cursor_pos: cursorPosChar,
          });

          const timeout = new Promise<null>(resolve => {
            const timeoutId = setTimeout(() => resolve(null), config.timeout);
            void requestPromise.finally(() => clearTimeout(timeoutId));
          });

          reply = await Promise.race([
            requestPromise.then(msg => msg.content),
            timeout,
          ]);
        } catch {
          return { items: [] };
        }

        if (!reply || reply.status !== 'ok') {
          return { items: [] };
        }

        return {
          items: buildSuffixes(
            fullText,
            cursorOffsetJs,
            reply,
            config.maxSuggestions,
            config.minPrefixLength
          ),
        };
      },
    };

    providerManager.registerInlineProvider(provider);
  },
};

export default plugin;
