export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = new URL(config.public.siteUrl || getRequestURL(event).origin)
  const canonicalUrl = new URL('/', siteUrl)

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl.href}</loc>
  </url>
</urlset>
`
})
