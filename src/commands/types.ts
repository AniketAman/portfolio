import type { ResumeData } from '../content/types';

export type CommandSection = {
  heading: string;
  lines: string[];
};

export type CommandLink = {
  label: string;
  url: string;
};

export type CommandResult = {
  title?: string;
  body?: string[];
  sections?: CommandSection[];
  links?: CommandLink[];
  tone?: 'default' | 'accent' | 'success' | 'error';
};

export type CommandContext = {
  themes: string[];
  activeTheme: string;
  resume: ResumeData;
};

export type CommandEffect =
  | { type: 'clear-history' }
  | { type: 'set-theme'; theme: string };

export type CommandExecution = {
  result: CommandResult;
  effects?: CommandEffect[];
};

export type CommandDefinition = {
  name: string;
  description: string;
  usage?: string;
  aliases?: string[];
  handler: (args: string[], context: CommandContext) => CommandExecution;
};

export type ParsedCommand = {
  raw: string;
  name: string;
  args: string[];
};

export type SuggestionItem =
  | {
      kind: 'command';
      value: string;
      label: string;
      description: string;
      completion: string;
    }
  | {
      kind: 'argument';
      value: string;
      label: string;
      description: string;
      completion: string;
    };
