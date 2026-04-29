import type { ResumeData } from '../content/types';
import type { CommandDefinition, SuggestionItem } from './types';

export function getSuggestions(
  input: string,
  commands: CommandDefinition[],
  resume: ResumeData | null,
): SuggestionItem[] {
  if (!input.startsWith('/')) {
    return [];
  }

  const trimmed = input.trimStart();
  const withoutSlash = trimmed.slice(1);

  if (withoutSlash.startsWith('project ')) {
    const query = withoutSlash.slice('project '.length).trim().toLowerCase();
    return (resume?.projects ?? [])
      .filter((project) => project.slug.includes(query))
      .map((project) => ({
        kind: 'argument' as const,
        value: project.slug,
        label: `/project ${project.slug}`,
        description: project.tagline,
        completion: `/project ${project.slug}`,
      }));
  }

  const query = withoutSlash.toLowerCase();
  return commands
    .filter((command) => {
      if (query.length === 0) {
        return true;
      }

      return (
        command.name.includes(query) ||
        command.aliases?.some((alias) => alias.includes(query)) === true
      );
    })
    .map((command) => ({
      kind: 'command' as const,
      value: command.name,
      label: `/${command.name}`,
      description: command.description,
      completion: command.usage?.startsWith('/project ')
        ? '/project '
        : `/${command.name}`,
    }));
}
