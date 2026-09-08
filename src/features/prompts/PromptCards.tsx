import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import type {
  PendingPermission,
  PendingUserInput,
  UserInputField,
  UserInputFieldValue,
  UserInputReplyInput,
} from '../../../shared/contracts'

export function PermissionCard({
  permission,
  disabled,
  onReply,
}: {
  permission: PendingPermission
  disabled: boolean
  onReply: (optionId: string) => void
}) {
  return (
    <section className="permission-card">
      <p className="eyebrow">Permission needed</p>
      <h3>{permission.title}</h3>
      <div className="permission-card__actions">
        {permission.options.map((option) => (
          <button
            className={
              option.kind.startsWith('allow')
                ? 'primary-button'
                : 'secondary-button'
            }
            disabled={disabled}
            key={option.optionId}
            onClick={() => onReply(option.optionId)}
            type="button"
          >
            {option.name}
          </button>
        ))}
      </div>
    </section>
  )
}

function initialUserInputValues(
  form: PendingUserInput['form'],
): Record<string, UserInputFieldValue> {
  const values: Record<string, UserInputFieldValue> = {}
  for (const field of form?.fields || []) {
    if (field.default !== undefined) {
      values[field.name] = field.default
    } else if (field.type === 'boolean') {
      values[field.name] = false
    } else if (field.type === 'array') {
      values[field.name] = []
    }
  }
  return values
}

function userInputFieldHasValue(
  field: UserInputField,
  value: UserInputFieldValue | undefined,
): boolean {
  if (value === undefined) {
    return false
  }
  if (field.type === 'string') {
    return typeof value === 'string' && value.trim().length > 0
  }
  if (field.type === 'array') {
    return (
      Array.isArray(value) &&
      (field.minItems === undefined || value.length >= field.minItems)
    )
  }
  return true
}

export function UserInputFieldControl({
  field,
  value,
  disabled,
  onChange,
}: {
  field: UserInputField
  value: UserInputFieldValue | undefined
  disabled: boolean
  onChange: (value: UserInputFieldValue | undefined) => void
}) {
  const [optionIndex, setOptionIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const requiredMark = field.required ? ' *' : ''
  const options = field.options || []
  const selectedIndex =
    typeof value === 'string'
      ? options.findIndex((option) => option.value === value)
      : -1

  useEffect(() => {
    if (menuOpen) {
      setOptionIndex(selectedIndex >= 0 ? selectedIndex : 0)
      menuRef.current?.focus()
    }
  }, [menuOpen, selectedIndex])

  function moveOption(direction: 1 | -1) {
    if (options.length === 0) {
      return
    }
    setOptionIndex(
      (current) => (current + direction + options.length) % options.length,
    )
  }

  function chooseOption(index: number) {
    const option = options[index]
    if (!option) {
      return
    }
    onChange(option.value)
    setMenuOpen(false)
    triggerRef.current?.focus()
  }

  function optionDirection(event: KeyboardEvent): 1 | -1 | undefined {
    const key = event.key.toLowerCase()
    const plainVimKey =
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey
    if (
      event.key === 'ArrowDown' ||
      (plainVimKey && key === 'j') ||
      (event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        key === 'n')
    ) {
      return 1
    }
    if (
      event.key === 'ArrowUp' ||
      (plainVimKey && key === 'k') ||
      (event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        key === 'p')
    ) {
      return -1
    }
    return undefined
  }

  function toggleOption(option: string) {
    const selected = Array.isArray(value) ? value : []
    onChange(
      selected.includes(option)
        ? selected.filter((entry) => entry !== option)
        : [...selected, option],
    )
  }

  function handleMultiSelectKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = optionDirection(event)
    if (direction) {
      event.preventDefault()
      moveOption(direction)
      return
    }
    if (event.key === ' ' && event.target !== event.currentTarget) {
      return
    }
    if (event.key === ' ') {
      event.preventDefault()
      const option = options[optionIndex]
      if (option) {
        toggleOption(option.value)
      }
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const direction = optionDirection(event)
    if (direction) {
      event.preventDefault()
      if (!menuOpen) {
        setMenuOpen(true)
      } else {
        moveOption(direction)
      }
      return
    }
    if (event.key === 'Escape') {
      if (menuOpen) {
        event.preventDefault()
        event.stopPropagation()
        setMenuOpen(false)
      }
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!menuOpen) {
        setMenuOpen(true)
      } else {
        chooseOption(optionIndex)
      }
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = optionDirection(event)
    if (direction) {
      event.preventDefault()
      moveOption(direction)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setMenuOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (event.key === 'Tab') {
      setMenuOpen(false)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      chooseOption(optionIndex)
    }
  }

  if (field.type === 'boolean') {
    return (
      <label className="user-input-card__field user-input-card__field--checkbox">
        <input
          checked={value === true}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>
          <strong>
            {field.title}
            {requiredMark}
          </strong>
          {field.description ? <small>{field.description}</small> : null}
        </span>
      </label>
    )
  }

  if (field.type === 'array' && options.length > 0) {
    const selected = Array.isArray(value) ? value : []
    return (
      <fieldset className="user-input-card__field">
        <legend>
          {field.title}
          {requiredMark}
        </legend>
        {field.description ? (
          <small className="user-input-card__field-description">
            {field.description}
          </small>
        ) : null}
        <div
          aria-label={`${field.title} options`}
          aria-keyshortcuts="ArrowDown ArrowUp j k Control+N Control+P Space"
          className="user-input-card__field-options"
          onKeyDown={handleMultiSelectKeyDown}
          role="group"
          tabIndex={0}
        >
          {options.map((option, index) => (
            <label
              className={`user-input-card__option ${
                index === optionIndex
                  ? 'user-input-card__option--highlighted'
                  : ''
              }`}
              key={`${field.name}:${option.value}`}
              onMouseEnter={() => setOptionIndex(index)}
            >
              <input
                checked={selected.includes(option.value)}
                disabled={disabled}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, option.value]
                      : selected.filter((entry) => entry !== option.value),
                  )
                }
                type="checkbox"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (options.length > 0) {
    return (
      <div className="user-input-card__field">
        <span>
          <strong>
            {field.title}
            {requiredMark}
          </strong>
          {field.description ? <small>{field.description}</small> : null}
        </span>
        <div className="user-input-card__select">
          <button
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            aria-label={field.title}
            aria-keyshortcuts="ArrowDown ArrowUp j k Control+N Control+P Enter Space Escape"
            className="user-input-card__select-trigger"
            disabled={disabled}
            onClick={() => setMenuOpen((current) => !current)}
            onKeyDown={handleTriggerKeyDown}
            ref={triggerRef}
            type="button"
          >
            <span>{options[selectedIndex]?.label || 'Select an option…'}</span>
            <ChevronDown aria-hidden="true" size={15} />
          </button>
          {menuOpen ? (
            <div
              aria-label={`${field.title} options`}
              aria-keyshortcuts="ArrowDown ArrowUp j k Control+N Control+P Enter Space Escape"
              className="user-input-card__select-menu"
              onKeyDown={handleMenuKeyDown}
              ref={menuRef}
              role="listbox"
              tabIndex={0}
            >
              {options.map((option, index) => (
                <button
                  aria-selected={index === selectedIndex}
                  className={`user-input-card__select-option ${
                    index === selectedIndex
                      ? 'user-input-card__select-option--selected'
                      : ''
                  } ${
                    index === optionIndex
                      ? 'user-input-card__select-option--highlighted'
                      : ''
                  }`}
                  key={`${field.name}:${option.value}`}
                  onClick={() => chooseOption(index)}
                  onMouseEnter={() => setOptionIndex(index)}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const inputType =
    field.type === 'number' || field.type === 'integer'
      ? 'number'
      : field.format === 'email'
        ? 'email'
        : field.format === 'uri'
          ? 'url'
          : field.format === 'date'
            ? 'date'
            : field.format === 'date-time'
              ? 'datetime-local'
              : 'text'
  const inputValue =
    typeof value === 'string' || typeof value === 'number' ? String(value) : ''
  return (
    <label className="user-input-card__field">
      <span>
        <strong>
          {field.title}
          {requiredMark}
        </strong>
        {field.description ? <small>{field.description}</small> : null}
      </span>
      <input
        aria-label={field.title}
        disabled={disabled}
        max={field.maximum}
        maxLength={field.maxLength}
        min={field.minimum}
        minLength={field.minLength}
        onChange={(event) => {
          const next = event.target.value
          if (!next) {
            onChange(field.type === 'array' ? [] : undefined)
          } else if (field.type === 'array') {
            onChange(
              next
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean),
            )
          } else if (field.type === 'number' || field.type === 'integer') {
            const numeric = Number(next)
            onChange(Number.isFinite(numeric) ? numeric : undefined)
          } else {
            onChange(next)
          }
        }}
        placeholder={field.type === 'array' ? 'value 1, value 2' : undefined}
        required={field.required}
        step={field.type === 'integer' ? 1 : undefined}
        type={inputType}
        value={inputValue}
      />
    </label>
  )
}

export function UserInputCard({
  request,
  disabled,
  onReply,
}: {
  request: PendingUserInput
  disabled: boolean
  onReply: (input: UserInputReplyInput) => void
}) {
  const [answer, setAnswer] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [values, setValues] = useState<Record<string, UserInputFieldValue>>(
    () => initialUserInputValues(request.form),
  )

  if (request.form) {
    const canSubmit = request.form.fields.every(
      (field) =>
        !field.required || userInputFieldHasValue(field, values[field.name]),
    )
    return (
      <section className="user-input-card">
        <p className="eyebrow">Agent input</p>
        <h3>{request.question}</h3>
        <form
          aria-keyshortcuts="Control+Enter Enter Escape"
          className="user-input-card__structured-form"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              onReply({
                action: 'cancel',
                answer: '',
                wasFreeform: false,
              })
              return
            }
            const target =
              event.target instanceof HTMLElement
                ? event.target
                : undefined
            const inMultiSelect = Boolean(target?.closest('[role="group"]'))
            if (
              event.key === 'Enter' &&
              (event.ctrlKey || event.metaKey || inMultiSelect)
            ) {
              event.preventDefault()
              if (canSubmit) {
                event.currentTarget.requestSubmit()
              }
            }
          }}
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSubmit) {
              return
            }
            const content: Record<string, UserInputFieldValue> = {}
            for (const field of request.form?.fields || []) {
              const value = values[field.name]
              if (value !== undefined) {
                content[field.name] = value
              }
            }
            onReply({
              answer: JSON.stringify(content),
              wasFreeform: false,
              values: content,
            })
          }}
        >
          <p className="user-input-card__shortcut-hint">
            ↑/↓ or j/k navigate · Ctrl+P/N move · Space select · Enter submit ·
            Esc cancel
          </p>
          <div className="user-input-card__fields">
            {request.form.fields.map((field) => (
              <UserInputFieldControl
                disabled={disabled}
                field={field}
                key={field.name}
                onChange={(value) =>
                  setValues((current) => {
                    const next = { ...current }
                    if (value === undefined) {
                      delete next[field.name]
                    } else {
                      next[field.name] = value
                    }
                    return next
                  })
                }
                value={values[field.name]}
              />
            ))}
          </div>
          <div className="user-input-card__actions">
            <button
              className="primary-button"
              disabled={disabled || !canSubmit}
              type="submit"
            >
              Submit
            </button>
            <button
              className="secondary-button"
              disabled={disabled}
              onClick={() =>
                onReply({
                  action: 'cancel',
                  answer: '',
                  wasFreeform: false,
                })
              }
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    )
  }

  const multiSelect = request.multiSelect === true

  return (
    <section className="user-input-card">
      <p className="eyebrow">Agent question</p>
      <h3>{request.question}</h3>
      {multiSelect && request.choices.length > 0 ? (
        <div className="user-input-card__options">
          {request.choices.map((choice) => (
            <label className="user-input-card__option" key={choice}>
              <input
                checked={selected.includes(choice)}
                disabled={disabled}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, choice]
                      : current.filter((value) => value !== choice),
                  )
                }
                type="checkbox"
              />
              <span>{choice}</span>
            </label>
          ))}
          <button
            className="primary-button"
            disabled={disabled || selected.length === 0}
            onClick={() =>
              onReply({
                answer: selected.join(', '),
                wasFreeform: false,
                answers: selected,
              })
            }
            type="button"
          >
            Answer
          </button>
        </div>
      ) : null}
      {!multiSelect && request.choices.length > 0 ? (
        <div className="user-input-card__choices">
          {request.choices.map((choice) => (
            <button
              className="secondary-button"
              disabled={disabled}
              key={choice}
              onClick={() => onReply({ answer: choice, wasFreeform: false })}
              type="button"
            >
              {choice}
            </button>
          ))}
        </div>
      ) : null}
      {request.allowFreeform ? (
        <form
          className="user-input-card__form"
          onSubmit={(event) => {
            event.preventDefault()
            if (answer.trim()) {
              onReply({ answer: answer.trim(), wasFreeform: true })
            }
          }}
        >
          <input
            aria-label="Your answer"
            disabled={disabled}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer…"
            value={answer}
          />
          <button
            className="primary-button"
            disabled={disabled || !answer.trim()}
            type="submit"
          >
            Answer
          </button>
        </form>
      ) : null}
    </section>
  )
}
