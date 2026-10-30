<script setup lang="ts">
import type { Story } from '~/types/story'

defineProps<{
  stories: Story[]
}>()

const emit = defineEmits<{
  share: []
}>()
</script>

<template>
  <aside id="most-loved" class="sidebar">
    <div class="most-loved-card">
      <div class="sidebar-kicker"><span>✳</span> reader favorites</div>
      <h3 class="serif">Most <em>loved</em></h3>
      <p class="sidebar-description">The stories with the most notes in the margins.</p>
      <a
        v-for="(story, index) in stories"
        :key="story.id"
        :href="story.url"
        target="_blank"
        rel="noopener noreferrer"
        class="top-story"
      >
        <span class="top-rank">0{{ index + 1 }}</span>
        <span class="top-story-info"><strong class="serif">{{ story.title }}</strong><small>{{ story.fandom }}</small></span>
        <span class="top-count"><UIcon name="i-lucide-heart" class="size-3" />{{ story.reviewCount }}</span>
      </a>
      <a href="#discover" class="see-all">
        See all stories
        <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
      </a>
    </div>
    <div class="shelf-note paper-grain">
      <span class="note-illustration">“</span>
      <p class="serif">Every what-if is a doorway to a world waiting to be found.</p>
      <span class="note-credit">A LITTLE REMINDER FROM US</span>
      <span class="note-spark">✳</span>
    </div>
    <div class="submit-prompt">
      <div class="prompt-icon"><UIcon name="i-lucide-book-heart" class="size-5" /></div>
      <div>
        <strong>Have one to share?</strong>
        <p>Give your favorite AU a little more love.</p>
      </div>
      <button aria-label="Share a story" @click="emit('share')">
        <UIcon name="i-lucide-arrow-up-right" class="size-4" />
      </button>
    </div>
  </aside>
</template>
