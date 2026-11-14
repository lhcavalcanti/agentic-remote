import { Command } from 'lucide-react'
import type { ComposerProps } from './types'

export function SlashCommandMenu({
  commandSuggestions,
  selectedCommandIndex,
  onSelectCommand,
}: Pick<ComposerProps, 'commandSuggestions' | 'selectedCommandIndex' | 'onSelectCommand'>) {
  return (
    <div className="command-menu" role="listbox" aria-label="Commands">
      {commandSuggestions.map((command, index) => (
        <button
          aria-selected={index === selectedCommandIndex}
          className={`command-menu__item ${
            index === selectedCommandIndex ? 'command-menu__item--selected' : ''
          }`}
          key={command.name}
          onClick={() => onSelectCommand(command)}
          role="option"
          type="button"
        >
          <Command size={14} />
          <span>
            <strong>/{command.name}</strong>
            <small>{command.description}</small>
          </span>
          {command.inputHint ? <em>{command.inputHint}</em> : null}
        </button>
      ))}
    </div>
  )
}
