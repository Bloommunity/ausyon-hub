<script setup lang="ts">
import type { Story, StoryReview } from '~/types/story'
import {
  formatRelativeDate,
  getAuType,
  getOtherStoryTags,
  getStoryShareLinks
} from '~/utils/story-presentation'

const props = defineProps<{
  story: Story
  index: number
  expanded: boolean
  reviews: StoryReview[]
  isLoadingReviews: boolean
  supabaseConnected: boolean
  canUseNativeShare: boolean
}>()

const emit = defineEmits<{
  review: [story: Story]
  toggleReviews: [story: Story]
}>()
const toast = useToast()

async function shareStory() {
  try {
    await navigator.share({
      title: `${props.story.title} — ${props.story.fandom}`,
      text: props.story.summary,
      url: props.story.url
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    toast.add({
      title: 'Could not share this story',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error'
    })
  }
}

async function copyStoryLink() {
  try {
    await navigator.clipboard.writeText(props.story.url)
    toast.add({
      title: 'Story link copied',
      description: 'Share it anywhere you like.',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Could not copy the story link',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error'
    })
  }
}
</script>

<template>
  <article class="story-card" :class="{ 'story-card-featured': index === 0 }">
    <div class="story-topline">
      <span class="platform-label">
        <span class="platform-dot" :class="`platform-dot-${story.platform.toLowerCase()}`" />
        {{ story.platform === 'X' ? 'X (formerly Twitter)' : story.platform }}
      </span>
      <span class="story-date">Added {{ formatRelativeDate(story.createdAt) }}</span>
    </div>
    <div class="story-content">
      <div class="story-copy">
        <div class="fandom-label">{{ story.fandom }}</div>
        <a :href="story.url" target="_blank" rel="noopener noreferrer" class="story-title serif">
          {{ story.title }}
          <UIcon name="i-lucide-arrow-up-right" class="story-external" />
        </a>
        <p class="story-summary">{{ story.summary }}</p>
        <div class="story-tags">
          <span v-if="getAuType(story)" class="story-au-type">AU type · {{ getAuType(story) }}</span>
          <span v-for="tag in getOtherStoryTags(story)" :key="tag">{{ tag }}</span>
        </div>
      </div>
      <div class="story-aside">
        <div class="rating-mark"><span>✦</span> {{ story.rating.toFixed(1) }}</div>
        <div class="review-count"><strong>{{ story.reviewCount }}</strong><br>little notes</div>
      </div>
    </div>
    <div class="story-footer">
      <div class="author-lockup">
        <span class="author-avatar">{{ story.author.slice(0, 1).toUpperCase() }}</span>
        <span>by <strong>{{ story.author }}</strong></span>
      </div>
      <div class="story-actions">
        <details class="share-menu">
          <summary class="review-link share-menu-trigger">
            <UIcon name="i-lucide-share-2" class="size-4" />
            Share
          </summary>
          <div class="share-menu-panel">
            <button v-if="canUseNativeShare" type="button" @click="shareStory">
              <UIcon name="i-lucide-send" class="size-4" />
              More options
            </button>
            <button type="button" @click="copyStoryLink">
              <UIcon name="i-lucide-copy" class="size-4" />
              Copy link
            </button>
            <a
              v-for="link in getStoryShareLinks(story)"
              :key="link.label"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </details>
        <button class="review-link read-notes-link" @click="emit('toggleReviews', story)">
          <UIcon name="i-lucide-messages-square" class="size-4" />
          {{ expanded ? 'Hide notes' : `Read ${story.reviewCount} notes` }}
        </button>
        <button class="review-link" @click="emit('review', story)">
          <UIcon name="i-lucide-message-square-text" class="size-4" />
          Leave a review
          <UIcon name="i-lucide-arrow-right" class="size-3.5" />
        </button>
      </div>
    </div>
    <div v-if="expanded" class="reader-notes">
      <div class="reader-notes-heading">
        <span class="serif">Notes in the margins</span><span>{{ story.reviewCount }} reviews</span>
      </div>
      <p v-if="isLoadingReviews" class="reader-notes-empty">Opening the notes…</p>
      <p v-else-if="!supabaseConnected" class="reader-notes-empty">
        Connect Supabase to open and add the community’s notes.
      </p>
      <p v-else-if="!reviews.length" class="reader-notes-empty">No notes yet. Be the first to leave one.</p>
      <template v-else>
        <article v-for="note in reviews" :key="note.id" class="reader-note">
          <div class="reader-note-meta">
            <strong>{{ note.author }}</strong>
            <span><span class="note-stars">✦</span> {{ note.rating }} / 5</span>
          </div>
          <p>{{ note.comment }}</p>
        </article>
      </template>
    </div>
  </article>
</template>
