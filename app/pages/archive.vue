<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useHead } from '#imports'
import { getAo3TitleSearchUrl, normalizeAo3WorkUrl } from '~/utils/ao3-archive'
import type { ArchiveLookupResponse, ArchiveSnapshot } from '~/types/archive'

const query = ref('')
const isSearching = ref(false)
const result = ref<ArchiveSnapshot | null>(null)
const hasSearchedUrl = ref(false)
const errorMessage = ref('')

const looksLikeUrl = computed(() =>
  /^(?:https?:\/\/)?(?:www\.)?archiveofourown\.org\//i.test(query.value.trim())
)
const workUrl = computed(() => normalizeAo3WorkUrl(query.value))
const titleSearchUrl = computed(() => getAo3TitleSearchUrl(query.value))

watch(query, () => {
  result.value = null
  hasSearchedUrl.value = false
  errorMessage.value = ''
})

useHead({
  title: 'AO3 Archive Search | AUsyon Hub',
  meta: [{
    name: 'description',
    content: 'Search for AO3 works or check whether a work has a saved Wayback Machine copy.'
  }]
})

async function searchArchive() {
  errorMessage.value = ''
  result.value = null
  hasSearchedUrl.value = false

  if (looksLikeUrl.value && !workUrl.value) {
    errorMessage.value = 'Enter a valid AO3 work or chapter URL.'
    return
  }

  if (!workUrl.value) {
    if (!query.value.trim()) return
    window.open(titleSearchUrl.value, '_blank', 'noopener,noreferrer')
    return
  }

  isSearching.value = true
  hasSearchedUrl.value = true
  try {
    const response = await $fetch<ArchiveLookupResponse>('/api/archive-lookup', {
      query: { url: workUrl.value }
    })
    result.value = response.snapshot
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'The archive could not be checked. Please try again.'
  } finally {
    isSearching.value = false
  }
}

function formatCaptureDate(timestamp: string) {
  const date = new Date(
    Date.UTC(
      Number(timestamp.slice(0, 4)),
      Number(timestamp.slice(4, 6)) - 1,
      Number(timestamp.slice(6, 8))
    )
  )
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeZone: 'UTC' }).format(date)
}
</script>

<template>
  <div class="archive-page min-h-screen">
    <LayoutSiteHeader
      :is-signed-in="false"
      user-label="writer"
      :show-share-action="false"
      active-page="archive"
    />

    <main class="archive-main mx-auto max-w-[920px] px-5 py-12 sm:px-8 sm:py-20">
      <NuxtLink to="/" class="archive-back-link">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        Back to the bookshelf
      </NuxtLink>

      <section class="archive-intro">
        <span class="archive-kicker"><UIcon name="i-lucide-book-open" class="size-4" /> AUsyon Hub · reader tools</span>
        <h1 class="serif">Find a story in the <em>archive.</em></h1>
        <p>
          Looking for an AO3 work? Search by title or author, or paste a work link to check
          for a saved Wayback Machine copy.
        </p>
      </section>

      <form class="archive-search-panel" @submit.prevent="searchArchive">
        <UFormField
          label="Work title, author, or AO3 link"
          hint="Search terms open indexed results; an AO3 work URL checks for a saved copy."
        >
          <UInput
            v-model="query"
            class="w-full"
            size="xl"
            icon="i-lucide-search"
            placeholder="Try a title, author, or https://archiveofourown.org/works/..."
            autocomplete="off"
            :disabled="isSearching"
          />
        </UFormField>
        <p v-if="!looksLikeUrl" class="archive-search-note">
          Wayback finds copies by URL rather than story title. If you search by title or author,
          open a matching AO3 work URL from the results and paste it here to check for a saved copy.
        </p>
        <p v-else class="archive-search-note">
          We’ll check the Wayback Machine for the latest saved copy of this AO3 work.
        </p>
        <p v-if="looksLikeUrl && query.trim() && !workUrl" class="archive-validation">
          Use a link to an AO3 work or chapter, such as archiveofourown.org/works/12345.
        </p>
        <UButton
          class="archive-search-button"
          color="primary"
          type="submit"
          :loading="isSearching"
          :disabled="!query.trim() || (looksLikeUrl && !workUrl)"
          :icon="looksLikeUrl ? 'i-lucide-history' : 'i-lucide-search'"
          :label="looksLikeUrl ? 'Check for archived copy' : 'Search titles and authors'"
        />
      </form>

      <UAlert
        v-if="errorMessage"
        class="archive-result"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Search could not be completed"
        :description="errorMessage"
      />

      <UAlert
        v-else-if="hasSearchedUrl && result"
        class="archive-result"
        color="success"
        variant="subtle"
        icon="i-lucide-archive"
        title="An archived copy is available"
        :description="`Latest saved copy: ${formatCaptureDate(result.timestamp)}`"
      >
        <template #actions>
          <UButton
            :to="result.url"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            trailing-icon="i-lucide-arrow-up-right"
            label="Open archived work"
          />
        </template>
      </UAlert>

      <UAlert
        v-else-if="hasSearchedUrl"
        class="archive-result"
        color="warning"
        variant="subtle"
        icon="i-lucide-archive-x"
        title="No saved copy found"
        description="The Wayback Machine has no available snapshot for this URL. You can try another AO3 work or chapter link."
      />

      <aside class="archive-note">
        <UIcon name="i-lucide-info" class="size-5" />
        <p>
          Archived copies are hosted by the Internet Archive, not AUsyon Hub. Some works may
          never have been saved, and archived pages can be incomplete.
        </p>
      </aside>
    </main>

    <LayoutSiteFooter />
  </div>
</template>
