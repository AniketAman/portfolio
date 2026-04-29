import type { ParsedCommand } from './types';

export function parseCommand(rawInput: string): ParsedCommand | null {
  const trimmed = rawInput.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const tokens = trimmed.slice(1).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return null;
  }

  const [name, ...args] = tokens;
  if (!name) {
    return null;
  }

  return {
    raw: trimmed,
    name: name.toLowerCase(),
    args,
  };
}
