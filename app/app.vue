<script setup lang="ts">
const config = useRuntimeConfig()
const requestUrl = useRequestURL()
const siteUrl = computed(() => new URL(config.public.siteUrl || requestUrl.origin).origin)
const canonicalUrl = computed(() => new URL('/', siteUrl.value).href)
const siteName = 'AUsyon Hub'
const pageTitle = 'AUsyon Hub | Discover Alternate Universe Stories'
const description = 'Discover, share, and review alternate universe stories from across AO3, Wattpad, and more.'
const imageUrl = computed(() => new URL('/images/social/og-image.png', siteUrl.value).href)

useSeoMeta({
  title: pageTitle,
  description,
  ogTitle: pageTitle,
  ogDescription: description,
  ogType: 'website',
  ogSiteName: siteName,
  ogUrl: canonicalUrl,
  ogImage: imageUrl,
  ogImageAlt: 'AUsyon Hub logo',
  ogImageSecureUrl: imageUrl,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: description,
  twitterImage: imageUrl,
  robots: 'index, follow'
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: canonicalUrl.value,
      description
    }))
  }]
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
