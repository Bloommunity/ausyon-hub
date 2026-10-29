export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = new URL(config.public.siteUrl || getRequestURL(event).origin)
  const sitemapUrl = new URL('/sitemap.xml', siteUrl)

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return `User-agent: *
Allow: /
Sitemap: ${sitemapUrl.href}
`
})
