export function normalizeAo3WorkUrl(value: string) {
  const trimmedValue = value.trim()
  const candidate = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`

  try {
    const url = new URL(candidate)
    if (
      url.protocol !== 'https:' ||
      !['archiveofourown.org', 'www.archiveofourown.org'].includes(url.hostname) ||
      url.port ||
      !/^\/works\/\d+(?:\/chapters\/\d+)?\/?$/.test(url.pathname)
    ) {
      return null
    }

    return `https://archiveofourown.org${url.pathname.replace(/\/$/, '')}`
  } catch {
    return null
  }
}

export function getAo3TitleSearchUrl(query: string) {
  const search = `site:archiveofourown.org/works ${query.trim()}`
  return `https://www.google.com/search?q=${encodeURIComponent(search)}`
}
