import type {
  CommandContext,
  CommandDefinition,
  CommandExecution,
  CommandResult,
} from './types';

function textResult(
  title: string,
  body: string[],
  tone: CommandResult['tone'] = 'default',
): CommandExecution {
  return {
    result: {
      title,
      body,
      tone,
    },
  };
}

function projectSummary(context: CommandContext) {
  return context.resume.projects.map(
    (project) =>
      `${project.slug}  ${project.name}  ${project.tagline}`,
  );
}

export const commands: CommandDefinition[] = [
  {
    name: 'help',
    description: 'List the available resume commands.',
    handler: () => ({
      result: {
        title: 'Available Commands',
        sections: [
          {
            heading: 'Explore',
            lines: [
              '/about',
              '/experience',
              '/projects',
              '/project <slug>',
              '/skills',
              '/education',
              '/contact',
              '/resume',
              '/now',
            ],
          },
          {
            heading: 'Utilities',
            lines: ['/theme <ember|ocean|graphite>', '/clear', '/help'],
          },
        ],
      },
    }),
  },
  {
    name: 'about',
    description: 'Show a concise professional summary.',
    handler: (_, context) =>
      textResult('About', [
        `${context.resume.profile.name}  ${context.resume.profile.role}`,
        `${context.resume.profile.location}`,
        '',
        context.resume.profile.summary,
        ...context.resume.about,
      ]),
  },
  {
    name: 'experience',
    description: 'Show work history and impact.',
    handler: (_, context) => ({
      result: {
        title: 'Experience',
        sections: context.resume.experience.map((item) => ({
          heading: `${item.role}  ${item.company}  ${item.period}`,
          lines: item.details,
        })),
      },
    }),
  },
  {
    name: 'projects',
    description: 'List selected portfolio projects.',
    handler: (_, context) => ({
      result: {
        title: 'Projects',
        body: [
          'Use /project <slug> for detail.',
          '',
          ...projectSummary(context),
        ],
      },
    }),
  },
  {
    name: 'project',
    description: 'Open a specific project by slug.',
    usage: '/project <slug>',
    handler: (args, context) => {
      const slug = args[0]?.toLowerCase();
      if (!slug) {
        return {
          result: {
            title: 'Project',
            body: ['Usage: /project <slug>', '', ...projectSummary(context)],
            tone: 'error',
          },
        };
      }

      const project = context.resume.projects.find((item) => item.slug === slug);
      if (!project) {
        return {
          result: {
            title: 'Project Not Found',
            body: [`No project matches "${slug}".`, '', ...projectSummary(context)],
            tone: 'error',
          },
        };
      }

      return {
        result: {
          title: `${project.name}  ${project.tagline}`,
          body: [project.description],
          sections: [
            {
              heading: 'Stack',
              lines: [project.stack.join('  |  ')],
            },
            {
              heading: 'Highlights',
              lines: project.highlights,
            },
          ],
          links: project.links,
        },
      };
    },
  },
  {
    name: 'skills',
    description: 'List technical and product strengths.',
    handler: (_, context) => ({
      result: {
        title: 'Skills',
        sections: [
          { heading: 'Languages', lines: [context.resume.skills.languages.join('  |  ')] },
          { heading: 'Frontend', lines: [context.resume.skills.frontend.join('  |  ')] },
          { heading: 'Backend', lines: [context.resume.skills.backend.join('  |  ')] },
          { heading: 'Product', lines: [context.resume.skills.product.join('  |  ')] },
        ],
      },
    }),
  },
  {
    name: 'education',
    description: 'Show education details.',
    handler: (_, context) =>
      textResult('Education', [
        context.resume.education.school,
        context.resume.education.degree,
        context.resume.education.period,
      ]),
  },
  {
    name: 'contact',
    description: 'Show direct contact links.',
    handler: (_, context) => ({
      result: {
        title: 'Contact',
        body: [context.resume.profile.email],
        links: [
          { label: 'Website', url: context.resume.profile.website },
          { label: 'GitHub', url: context.resume.profile.github },
          { label: 'LinkedIn', url: context.resume.profile.linkedin },
        ],
      },
    }),
  },
  {
    name: 'resume',
    description: 'Show the short-form resume snapshot.',
    handler: (_, context) => ({
      result: {
        title: 'Resume Snapshot',
        body: [
          `${context.resume.profile.name}  ${context.resume.profile.role}`,
          context.resume.profile.summary,
          '',
          'Best commands: /experience  /projects  /skills  /contact',
        ],
      },
    }),
  },
  {
    name: 'now',
    description: 'Show current interests and focus areas.',
    handler: (_, context) => textResult('Current Focus', context.resume.currentFocus, 'accent'),
  },
  {
    name: 'theme',
    description: 'Switch the terminal theme.',
    usage: '/theme <ember|ocean|graphite>',
    handler: (args, context: CommandContext) => {
      const selected = args[0]?.toLowerCase();
      if (!selected) {
        return {
          result: {
            title: 'Theme',
            body: [
              `Active theme: ${context.activeTheme}`,
              `Available: ${context.themes.join(', ')}`,
            ],
          },
        };
      }

      if (!context.themes.includes(selected)) {
        return {
          result: {
            title: 'Theme',
            body: [
              `Unknown theme "${selected}".`,
              `Available: ${context.themes.join(', ')}`,
            ],
            tone: 'error',
          },
        };
      }

      return {
        result: {
          title: 'Theme Updated',
          body: [`Switched terminal theme to ${selected}.`],
          tone: 'success',
        },
        effects: [{ type: 'set-theme', theme: selected }],
      };
    },
  },
  {
    name: 'clear',
    description: 'Clear the terminal history.',
    handler: () => ({
      result: {
        title: 'Session Reset',
        body: ['Terminal history cleared. Type /help to start again.'],
      },
      effects: [{ type: 'clear-history' }],
    }),
  },
];

export function resolveCommand(name: string) {
  return commands.find(
    (command) =>
      command.name === name || command.aliases?.includes(name) === true,
  );
}
