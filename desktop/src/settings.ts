import { invoke } from '@tauri-apps/api/core'

interface HubConfig {
  url?: string | null
  lanUrl?: string | null
  shortcut?: string | null
}

const form = document.querySelector<HTMLFormElement>('#settings-form')!
const urlField = document.querySelector<HTMLInputElement>('#hub-url')!
const lanField = document.querySelector<HTMLInputElement>('#hub-lan-url')!
const shortcutField =
  document.querySelector<HTMLInputElement>('#hub-shortcut')!
const errorBox = document.querySelector<HTMLParagraphElement>('#settings-error')!
const submit = form.querySelector<HTMLButtonElement>('.settings__submit')!

function showError(message: string): void {
  errorBox.textContent = message
  errorBox.hidden = false
}

function clearError(): void {
  errorBox.textContent = ''
  errorBox.hidden = true
}

function trimmed(field: HTMLInputElement): string | null {
  const value = field.value.trim()
  return value ? value : null
}

async function load(): Promise<void> {
  try {
    const config = await invoke<HubConfig>('hub_config')
    urlField.value = config.url ?? ''
    lanField.value = config.lanUrl ?? ''
    shortcutField.value = config.shortcut ?? ''
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : 'Unable to read the saved settings.',
    )
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  clearError()
  submit.disabled = true
  void invoke('save_hub_config', {
    config: {
      url: trimmed(urlField),
      lanUrl: trimmed(lanField),
      shortcut: trimmed(shortcutField),
    } satisfies HubConfig,
  })
    .catch((error: unknown) => {
      showError(
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : 'Unable to open that hub.',
      )
    })
    .finally(() => {
      submit.disabled = false
    })
})

void load()
