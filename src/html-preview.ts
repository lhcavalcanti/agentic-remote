export const HTML_PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'none'",
  "connect-src 'none'",
  "style-src 'unsafe-inline'",
  'img-src data:',
  'font-src data:',
  'media-src data:',
  "object-src 'none'",
  "frame-src 'none'",
  "child-src 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "navigate-to 'none'",
].join('; ')

const blockedElements = [
  'animate',
  'animatemotion',
  'animatetransform',
  'applet',
  'base',
  'embed',
  'frame',
  'frameset',
  'iframe',
  'link',
  'meta',
  'object',
  'portal',
  'script',
  'set',
]

const blockedAttributes = new Set([
  'action',
  'archive',
  'attributionsrc',
  'autofocus',
  'autoplay',
  'background',
  'cite',
  'classid',
  'codebase',
  'command',
  'commandfor',
  'contenteditable',
  'data',
  'download',
  'formaction',
  'href',
  'longdesc',
  'manifest',
  'ping',
  'popover',
  'popovertarget',
  'popovertargetaction',
  'profile',
  'srcdoc',
  'srcset',
  'target',
  'xlink:href',
])

const disabledControls = new Set([
  'button',
  'fieldset',
  'input',
  'select',
  'textarea',
])

function isAllowedDataSource(element: Element, value: string): boolean {
  const tag = element.tagName.toLowerCase()
  const normalized = value.trim().toLowerCase()
  if (tag === 'img') {
    return normalized.startsWith('data:image/')
  }
  if (tag === 'audio') {
    return normalized.startsWith('data:audio/')
  }
  if (tag === 'video') {
    return normalized.startsWith('data:video/')
  }
  if (tag === 'source') {
    return /^data:(?:audio|video)\//.test(normalized)
  }
  if (tag === 'track') {
    return normalized.startsWith('data:text/vtt')
  }
  return false
}

function sanitizeTree(root: ParentNode): void {
  for (const form of Array.from(root.querySelectorAll('form'))) {
    form.replaceWith(...Array.from(form.childNodes))
  }
  for (const element of Array.from(root.querySelectorAll('*'))) {
    const tag = element.tagName.toLowerCase()
    if (blockedElements.includes(tag)) {
      element.remove()
      continue
    }
    if (tag === 'template' && element instanceof HTMLTemplateElement) {
      sanitizeTree(element.content)
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      if (name.startsWith('on') || blockedAttributes.has(name)) {
        element.removeAttribute(attribute.name)
        continue
      }
      if (
        name === 'src' &&
        !isAllowedDataSource(element, attribute.value)
      ) {
        element.removeAttribute(attribute.name)
        continue
      }
      if (
        name === 'poster' &&
        !attribute.value.trim().toLowerCase().startsWith('data:image/')
      ) {
        element.removeAttribute(attribute.name)
      }
    }
    if (tag === 'a' || tag === 'area') {
      element.setAttribute('aria-disabled', 'true')
      element.setAttribute('tabindex', '-1')
    }
    if (disabledControls.has(tag)) {
      element.setAttribute('disabled', '')
      element.setAttribute('aria-disabled', 'true')
    }
  }
}

export function createHtmlPreviewDocument(source: string): string {
  const document = new DOMParser().parseFromString(source, 'text/html')
  sanitizeTree(document)

  const charset = document.createElement('meta')
  charset.setAttribute('charset', 'utf-8')
  const csp = document.createElement('meta')
  csp.setAttribute('http-equiv', 'Content-Security-Policy')
  csp.setAttribute('content', HTML_PREVIEW_CSP)
  document.head.prepend(csp)
  document.head.prepend(charset)

  return `<!doctype html>\n${document.documentElement.outerHTML}`
}
