import type { CommandResult } from '../../commands/types';

type Props = {
  result: CommandResult;
};

export function CommandRenderer({ result }: Props) {
  return (
    <div className={`result-card tone-${result.tone ?? 'default'}`}>
      {result.title ? (
        <div className="result-title">
          <span className="result-marker" aria-hidden="true">
            {'>'}
          </span>
          <span>{result.title}</span>
        </div>
      ) : null}

      {result.body?.length ? (
        <div className="result-block">
          {result.body.map((line, index) => (
            <p key={`${line}-${index}`} className={line ? 'result-line' : 'result-gap'}>
              {line || ' '}
            </p>
          ))}
        </div>
      ) : null}

      {result.sections?.map((section) => (
        <section key={section.heading} className="result-section">
          <div className="result-heading">{section.heading}</div>
          {section.lines.map((line, index) => (
            <p key={`${section.heading}-${index}`} className="result-line">
              {line}
            </p>
          ))}
        </section>
      ))}

      {result.links?.length ? (
        <div className="result-links">
          {result.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
