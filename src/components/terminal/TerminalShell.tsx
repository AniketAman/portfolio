import { useEffect, useRef, useState } from 'react';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useResumeData } from '../../hooks/useResumeData';
import { useTerminal } from '../../hooks/useTerminal';
import { CommandRenderer } from './CommandRenderer';
import { SuggestionMenu } from './SuggestionMenu';

function ThinkingRow({
  label,
  startedAt,
}: {
  label: string;
  startedAt: number;
}) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startedAt]);

  return (
    <p className="thinking-row">
      <span className="thinking-star" aria-hidden="true">
        *
      </span>
      <span className="thinking-label">{label}…</span>
      <span className="thinking-meta">({seconds}s · thinking)</span>
    </p>
  );
}

export function TerminalShell() {
  const { data: resume } = useResumeData();
  const {
    entries,
    input,
    setInput,
    onKeyDown,
    suggestions,
    suggestionOpen,
    selectedSuggestion,
    setSelectedSuggestion,
    acceptSuggestion,
    theme,
  } = useTerminal(resume);
  const terminalScrollRef = useAutoScroll<HTMLDivElement>(entries);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const profile = resume?.profile;
  const sessionName = profile?.name.toLowerCase().replace(/\s+/g, '-') ?? 'resume-session';
  const showLanding = entries.length <= 2;
  const cwd = `~/${sessionName}`;

  return (
    <main className={`app-shell theme-${theme}`}>
      <div className="app-backdrop" />

      <section className="terminal-window">
        <div className="terminal-body" ref={terminalScrollRef}>
          <div className="history-pane">
            <section className="session-header">
              <div className="session-avatar" aria-hidden="true">
                <span className="avatar-eye left" />
                <span className="avatar-eye right" />
                <span className="avatar-leg leg-1" />
                <span className="avatar-leg leg-2" />
                <span className="avatar-leg leg-3" />
              </div>
              <div className="session-copy">
                <div className="session-title">Claude Code v2.1.123</div>
                <div className="session-subtitle">
                  Mythos 4.9 · {profile?.role ?? 'Loading profile'}
                </div>
                <div className="session-path">{cwd}</div>
              </div>
            </section>

            {showLanding ? (
              <section className="landing-state">
                <div className="landing-panel">
                  <div className="landing-panel-left">
                    <div className="landing-panel-title">Welcome back!</div>
                    <div className="landing-panel-bot" aria-hidden="true">
                      <span className="bot-eye left" />
                      <span className="bot-eye right" />
                      <span className="bot-leg leg-1" />
                      <span className="bot-leg leg-2" />
                      <span className="bot-leg leg-3" />
                    </div>
                    <div className="landing-panel-meta">
                      {profile?.role ?? 'Resume mode'}
                    </div>
                    <div className="landing-panel-path">{cwd}</div>
                  </div>
                  <div className="landing-panel-divider" />
                  <div className="landing-panel-right">
                    <div className="landing-whats-new">What&apos;s new</div>
                    <p>
                      Added slash-command portfolio navigation for <code>/about</code>,{' '}
                      <code>/projects</code>, <code>/experience</code>, and <code>/contact</code>.
                    </p>
                    <p>
                      Resume content now loads from <code>resume.json</code> so the backend can
                      swap data sources without changing the UI.
                    </p>
                    <p>
                      Type <code>/help</code> to explore the full surface, or use{' '}
                      <code>/project courier</code> for a detailed project view.
                    </p>
                    <p className="landing-release-note">/resume for more</p>
                  </div>
                </div>
              </section>
            ) : null}

            {entries.map((entry) => (
              <div key={entry.id} className={`history-entry history-${entry.kind}`}>
                {entry.kind === 'system' ? (
                  <p className="system-line">{entry.content}</p>
                ) : null}
                {entry.kind === 'command' ? (
                  <p className="command-line">
                    <span className="terminal-chevron">{'›'}</span>
                    <span>{entry.content}</span>
                  </p>
                ) : null}
                {entry.kind === 'thinking' ? (
                  <ThinkingRow label={entry.label} startedAt={entry.startedAt} />
                ) : null}
                {entry.kind === 'result' ? <CommandRenderer result={entry.content} /> : null}
              </div>
            ))}
          </div>

          <div className="prompt-wrap">
            <label className="prompt-row" onClick={() => inputRef.current?.focus()}>
              <span className="terminal-chevron">{'›'}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                className="prompt-input"
                autoFocus
                spellCheck={false}
                aria-label="Terminal command input"
                placeholder={showLanding ? '' : 'Ask or type a command'}
              />
              <span className="prompt-caret" aria-hidden="true" />
            </label>

            {suggestionOpen ? (
              <SuggestionMenu
                items={suggestions}
                selectedIndex={selectedSuggestion}
                onHighlight={setSelectedSuggestion}
                onSelect={acceptSuggestion}
              />
            ) : null}

            <div className="status-row">
              <span className="status-item status-model">Model: Mythos: 4.9</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
