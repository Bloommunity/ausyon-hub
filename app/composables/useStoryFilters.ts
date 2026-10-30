import { computed, type Ref } from 'vue'
import type { Story } from '~/types/story'

export function useStoryFilters(
  stories: Ref<Story[]>,
  searchQuery: Ref<string>,
  activePlatform: Ref<string>,
  activeAuType: Ref<string>,
  sortMode: Ref<string>
) {
  return computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const filtered = stories.value.filter((story) => {
      const matchesPlatform =
        activePlatform.value === 'Everything' ||
        (activePlatform.value === 'Other'
          ? !['AO3', 'Wattpad', 'X'].includes(story.platform)
          : story.platform === activePlatform.value)
      const normalizedType = activeAuType.value.toLowerCase()
      const matchesAuType =
        activeAuType.value === 'Everything' ||
        story.tags.some((tag) => {
          const normalizedTag = tag.toLowerCase()
          return normalizedTag === normalizedType || normalizedTag.startsWith(`${normalizedType} `)
        })
      const searchable = [
        story.title,
        story.fandom,
        story.author,
        story.summary,
        ...story.tags
      ].join(' ').toLowerCase()

      return matchesPlatform && matchesAuType && (!query || searchable.includes(query))
    })

    return filtered.sort((a, b) =>
      sortMode.value === 'Most reviewed'
        ? b.reviewCount - a.reviewCount
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })
}
