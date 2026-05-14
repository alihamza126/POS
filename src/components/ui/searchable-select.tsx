/* eslint-disable react/require-default-props */
import * as React from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '../../shared/utils';

export interface SearchableSelectOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  /** Options to display in the dropdown */
  options: SearchableSelectOption[];
  /** Currently selected option id */
  value: string | null;
  /** Callback when an option is selected */
  onSelect: (option: SearchableSelectOption) => void;
  /** Callback when the selection is cleared */
  onClear?: () => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Placeholder text for the search input inside dropdown */
  searchPlaceholder?: string;
  /** Icon to show in the trigger button */
  icon?: React.ReactNode;
  /** Whether the dropdown opens upward (above trigger) */
  dropUp?: boolean;
  /** Additional className for the root container */
  className?: string;
  /** Whether the select is clearable */
  clearable?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom filter function; defaults to label+subtitle matching */
  filterFn?: (option: SearchableSelectOption, query: string) => boolean;
  /** Disable the component */
  disabled?: boolean;
}

function defaultFilter(option: SearchableSelectOption, query: string): boolean {
  const q = query.toLowerCase();
  return (
    option.label.toLowerCase().includes(q) ||
    (option.subtitle ? option.subtitle.toLowerCase().includes(q) : false)
  );
}

export default function SearchableSelect({
  options,
  value,
  onSelect,
  onClear,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  icon,
  dropUp = false,
  className,
  clearable = true,
  emptyMessage = 'No results found',
  filterFn = defaultFilter,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options;
    return options.filter((opt) => filterFn(opt, search));
  }, [options, search, filterFn]);

  const selectedOption = React.useMemo(
    () => options.find((o) => o.id === value) || null,
    [options, value],
  );

  const handleSelect = (option: SearchableSelectOption) => {
    onSelect(option);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) onClear();
    setSearch('');
  };

  const dropdownPositionClass = dropUp ? 'bottom-full mb-1' : 'top-full mt-1';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected state */}
      {selectedOption && value ? (
        <div className="flex items-center justify-between bg-[#02025C]/5 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <span className="text-sm font-bold text-[#02025C] truncate">
              {selectedOption.label}
            </span>
            {selectedOption.subtitle && (
              <span className="text-xs font-medium text-navy/40 truncate">
                {selectedOption.subtitle}
              </span>
            )}
          </div>
          {clearable && onClear && (
            <button
              type="button"
              onClick={handleClear}
              className="text-navy/30 hover:text-red-500 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        /* Trigger button */
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-[#F1EFF9] border border-navy/5 rounded-xl px-3 py-2 text-sm font-medium text-navy/40 hover:border-navy/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{placeholder}</span>
          </div>
          <ChevronDown
            size={14}
            className={cn('transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 right-0 bg-white rounded-xl shadow-xl border border-navy/10 overflow-hidden z-50 max-h-64 flex flex-col',
            dropdownPositionClass,
          )}
        >
          {/* Search input */}
          <div className="p-2 border-b border-navy/5 shrink-0">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy/30"
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F1EFF9] rounded-lg pl-8 pr-3 py-2 text-xs font-medium text-[#02025C] placeholder:text-navy/30 focus:outline-none focus:ring-1 focus:ring-[#24D4FE]"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-4 text-center text-xs font-medium text-navy/30">
                {emptyMessage}
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 hover:bg-[#F1EFF9] transition-colors border-b border-navy/5 last:border-none',
                    option.id === value && 'bg-primary/5',
                  )}
                >
                  <span className="text-sm font-bold text-[#02025C]">
                    {option.label}
                  </span>
                  {option.subtitle && (
                    <span className="text-xs font-medium text-navy/40 ml-2">
                      {option.subtitle}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
