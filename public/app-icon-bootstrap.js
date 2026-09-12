(() => {
  const fallback = '/icons/apple-touch-icon.png'
  let href = fallback
  try {
    const value = JSON.parse(localStorage.getItem('agentic-remote:app-icon') || 'null')
    if (
      value &&
      ["relay","bridge","orbit","beacon","atlas"].includes(value.style) &&
      ["agentic","ocean","violet","ember","rose","teal"].includes(value.color)
    ) {
      href = '/icons/app/app-' + value.style + '-' + value.color + '-180.png'
    }
  } catch {}
  document.write(
    '<link rel="apple-touch-icon" sizes="180x180" href="' + href + '">',
  )
})()
