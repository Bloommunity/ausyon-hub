import type { Story } from '~/types/story'

export const AU_TYPES = ['Angst', 'Fluff'] as const

export function getAuType(story: Story) {
  return AU_TYPES.find((type) =>
    story.tags.some((tag) => {
      const normalizedTag = tag.toLowerCase()
      const normalizedType = type.toLowerCase()
      return normalizedTag === normalizedType || normalizedTag.startsWith(`${normalizedType} `)
    })
  )
}

export function getOtherStoryTags(story: Story) {
  const auType = getAuType(story)
  return story.tags.filter((tag) => !auType || tag.toLowerCase() !== auType.toLowerCase())
}

export function formatRelativeDate(date: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export function getStoryShareLinks(story: Story) {
  const title = `${story.title} — ${story.fandom}`
  const message = `${title}\n${story.summary}\n${story.url}`
  return [
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(story.url)}`
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(story.url)}`
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(message)}`
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`
    }
  ]
}
