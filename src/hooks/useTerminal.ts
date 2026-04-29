import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { nanoid } from 'nanoid';
import { getSuggestions } from '../commands/autocomplete';
import { parseCommand } from '../commands/parser';
import { commands, resolveCommand } from '../commands/registry';
import type { ResumeData } from '../content/types';
import type {
  CommandContext,
  CommandExecution,
  CommandResult,
  SuggestionItem,
} from '../commands/types';

type Entry =
  | {
      id: string;
      kind: 'system';
      content: string;
    }
  | {
      id: string;
      kind: 'command';
      content: string;
    }
  | {
      id: string;
      kind: 'result';
      content: CommandResult;
    }
  | {
      id: string;
      kind: 'thinking';
      label: string;
      startedAt: number;
    };

const themes = ['ember', 'ocean', 'graphite'] as const;
const initialTheme = 'ember';
const responseDelayMs = 5000;
const thinkingLabels = [
  'Accomplishing',
  'Actioning',
  'Actualizing',
  'Architecting',
  'Baking',
  'Beaming',
  "Beboppin'",
  'Befuddling',
  'Billowing',
  'Blanching',
  'Bloviating',
  'Boogieing',
  'Boondoggling',
  'Booping',
  'Bootstrapping',
  'Brewing',
  'Bunning',
  'Burrowing',
  'Calculating',
  'Canoodling',
  'Caramelizing',
  'Cascading',
  'Catapulting',
  'Cerebrating',
  'Channeling',
  'Channelling',
  'Choreographing',
  'Churning',
  'Clauding',
  'Coalescing',
  'Cogitating',
] as const;

function bootEntries(): Entry[] {
  return [
    {
      id: nanoid(),
      kind: 'system',
      content: 'portfolio-terminal v1.0.0',
    },
    {
      id: nanoid(),
      kind: 'system',
      content: 'Interactive resume booted. Type /help or press / to explore.',
    },
  ];
}

export function useTerminal(resume: ResumeData | null) {
  const [entries, setEntries] = useState<Entry[]>(bootEntries);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<string>(initialTheme);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const timeoutsRef = useRef<number[]>([]);

  const suggestions = getSuggestions(input, commands, resume);
  const suggestionOpen = suggestions.length > 0 && input.startsWith('/');

  useEffect(() => {
    setSelectedSuggestion(0);
  }, [input]);

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }
      timeoutsRef.current = [];
    };
  }, []);

  function applyExecution(execution: CommandExecution) {
    const effects = execution.effects ?? [];
    const clearHistory = effects.some((effect) => effect.type === 'clear-history');

    for (const effect of effects) {
      if (effect.type === 'set-theme') {
        setTheme(effect.theme);
      }
    }

    setEntries((current) => {
      const nextEntries = clearHistory ? [] : current;
      return [
        ...nextEntries,
        {
          id: nanoid(),
          kind: 'result',
          content: execution.result,
        },
      ];
    });
  }

  function randomThinkingLabel() {
    const index = Math.floor(Math.random() * thinkingLabels.length);
    return thinkingLabels[index] ?? 'Cogitating';
  }

  function scheduleExecution(execution: CommandExecution) {
    const thinkingId = nanoid();
    const label = randomThinkingLabel();

    setEntries((current) => [
      ...current,
      {
        id: thinkingId,
        kind: 'thinking',
        label,
        startedAt: Date.now(),
      },
    ]);

    const timeoutId = window.setTimeout(() => {
      setEntries((current) => current.filter((entry) => entry.id !== thinkingId));
      applyExecution(execution);
      timeoutsRef.current = timeoutsRef.current.filter((id) => id !== timeoutId);
    }, responseDelayMs);

    timeoutsRef.current.push(timeoutId);
  }

  function execute(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setEntries((current) => [
      ...current,
      { id: nanoid(), kind: 'command', content: trimmed },
    ]);
    setHistory((current) => [...current, trimmed]);
    setHistoryIndex(null);

    const parsed = parseCommand(trimmed);
    if (!parsed) {
      scheduleExecution({
        result: {
          title: 'Unknown Input',
          body: ['Commands must begin with /. Try /help.'],
          tone: 'error',
        },
      });
      setInput('');
      return;
    }

    const command = resolveCommand(parsed.name);
    if (!command) {
      scheduleExecution({
        result: {
          title: 'Unknown Command',
          body: [`/${parsed.name} is not registered. Try /help.`],
          tone: 'error',
        },
      });
      setInput('');
      return;
    }

    if (!resume) {
      scheduleExecution({
        result: {
          title: 'Resume Data Unavailable',
          body: ['The content source is not loaded yet. Try again in a moment.'],
          tone: 'error',
        },
      });
      setInput('');
      return;
    }

    const context: CommandContext = {
      themes: [...themes],
      activeTheme: theme,
      resume,
    };

    scheduleExecution(command.handler(parsed.args, context));
    setInput('');
  }

  function acceptSuggestion(item: SuggestionItem) {
    setInput(item.completion);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestionOpen) {
      event.preventDefault();
      setSelectedSuggestion((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp' && suggestionOpen) {
      event.preventDefault();
      setSelectedSuggestion(
        (current) => (current - 1 + suggestions.length) % suggestions.length,
      );
      return;
    }

    if (event.key === 'Tab' && suggestionOpen) {
      event.preventDefault();
      const item = suggestions[selectedSuggestion];
      if (item) {
        acceptSuggestion(item);
      }
      return;
    }

    if (event.key === 'Escape' && suggestionOpen) {
      event.preventDefault();
      setInput('');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (suggestionOpen && input === '/') {
        const item = suggestions[selectedSuggestion];
        if (item) {
          acceptSuggestion(item);
          return;
        }
      }

      execute(input);
      return;
    }

    if (event.key === 'ArrowUp' && !suggestionOpen) {
      event.preventDefault();
      if (history.length === 0) {
        return;
      }

      if (historyIndex === null) {
        const nextIndex = history.length - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] ?? '');
        return;
      }

      const nextIndex = Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? '');
      return;
    }

    if (event.key === 'ArrowDown' && !suggestionOpen && historyIndex !== null) {
      event.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput('');
        return;
      }

      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? '');
    }
  }

  return {
    entries,
    input,
    setInput,
    onKeyDown,
    execute,
    suggestions,
    suggestionOpen,
    selectedSuggestion,
    setSelectedSuggestion,
    acceptSuggestion,
    theme,
  };
}
