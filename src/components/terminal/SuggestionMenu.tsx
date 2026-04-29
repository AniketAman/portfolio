import clsx from 'clsx';
import type { SuggestionItem } from '../../commands/types';

type Props = {
  items: SuggestionItem[];
  selectedIndex: number;
  onSelect: (item: SuggestionItem) => void;
  onHighlight: (index: number) => void;
};

export function SuggestionMenu({
  items,
  selectedIndex,
  onSelect,
  onHighlight,
}: Props) {
  return (
    <div className="suggestion-menu" role="listbox" aria-label="Command suggestions">
      {items.map((item, index) => (
        <button
          key={`${item.kind}-${item.value}`}
          type="button"
          className={clsx('suggestion-item', index === selectedIndex && 'is-active')}
          onMouseEnter={() => onHighlight(index)}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(item);
          }}
        >
          <span className="suggestion-label">{item.label}</span>
          <span className="suggestion-description">{item.description}</span>
        </button>
      ))}
    </div>
  );
}
