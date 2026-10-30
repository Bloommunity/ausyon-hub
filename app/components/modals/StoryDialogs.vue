<script setup lang="ts">
import type { Story, StorySubmissionForm } from '~/types/story'
import type { SiteAnnouncement } from '~/types/site-announcement'

defineProps<{
  selectedStory: Story | null
  announcement: SiteAnnouncement
  platformOptions: Array<{ label: string; value: string }>
  auTypeOptions: Array<{ label: string; value: string }>
  isSubmitting: boolean
}>()

const storyForm = defineModel<StorySubmissionForm>('storyForm', { required: true })
const submitOpen = defineModel<boolean>('submitOpen', { required: true })
const reviewOpen = defineModel<boolean>('reviewOpen', { required: true })
const announcementOpen = defineModel<boolean>('announcementOpen', { required: true })
const reviewRating = defineModel<number>('reviewRating', { required: true })
const reviewComment = defineModel<string>('reviewComment', { required: true })

const emit = defineEmits<{
  submitStory: []
  submitReview: []
  snoozeAnnouncement: []
}>()

const announcementImageFailed = ref(false)
</script>

<template>
  <UModal
    v-model:open="submitOpen"
    title="Leave one on the shelf"
    description="Share a link to an AU you love."
  >
    <template #body>
      <div class="modal-intro">
        <span class="modal-spark">✳</span>
        <p>A good story deserves to be found.</p>
      </div>
      <div class="modal-form">
        <UFormField label="Story title" required>
          <UInput v-model="storyForm.title" maxlength="160" placeholder="The name on the cover" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField label="Fandom" required>
            <UInput v-model="storyForm.fandom" maxlength="120" placeholder="Where does it take place?" class="w-full" />
          </UFormField>
          <UFormField label="Platform">
            <USelect v-model="storyForm.platform" :items="platformOptions" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Story link" required>
          <UInput v-model="storyForm.url" type="url" placeholder="https://..." icon="i-lucide-link" class="w-full" />
        </UFormField>
        <UFormField label="A little about it" required>
          <UTextarea
            v-model="storyForm.summary"
            maxlength="600"
            :rows="3"
            placeholder="No spoilers, just a little invitation..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="Type of AU" hint="Optional · choose a feeling">
          <USelect v-model="storyForm.auType" :items="auTypeOptions" class="w-full" />
        </UFormField>
        <UFormField label="Tags" hint="Optional · comma separated">
          <UInput v-model="storyForm.tags" placeholder="Slow burn, coffee shop AU..." class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer="{ close }">
      <UButton color="neutral" variant="outline" label="Maybe later" @click="close" />
      <UButton
        class="submit-button"
        :loading="isSubmitting"
        icon="i-lucide-sparkles"
        label="Add to the shelf"
        @click="emit('submitStory')"
      />
    </template>
  </UModal>

  <UModal
    v-model:open="reviewOpen"
    :title="`Leave a note for ${selectedStory?.title ?? 'this story'}`"
    description="A thoughtful review can make a writer's day."
  >
    <template #body>
      <div class="review-modal-story">
        <span class="fandom-label">{{ selectedStory?.fandom }}</span>
        <p class="serif">{{ selectedStory?.title }}</p>
      </div>
      <div class="rating-picker">
        <span class="rating-label">Your stars</span>
        <div class="star-buttons">
          <button
            v-for="star in 5"
            :key="star"
            :aria-label="`${star} stars`"
            :aria-pressed="reviewRating === star"
            @click="reviewRating = star"
          >
            <UIcon
              name="i-lucide-star"
              class="size-7"
              :class="star <= reviewRating ? 'star-filled' : 'star-empty'"
            />
          </button>
        </div>
      </div>
      <UFormField label="Your note in the margins" required>
        <UTextarea
          v-model="reviewComment"
          maxlength="1200"
          :rows="4"
          placeholder="What stayed with you after reading? (At least 8 characters)"
          class="w-full"
        />
      </UFormField>
    </template>
    <template #footer="{ close }">
      <UButton color="neutral" variant="outline" label="Cancel" @click="close" />
      <UButton
        class="submit-button"
        :loading="isSubmitting"
        icon="i-lucide-send"
        label="Leave my note"
        @click="emit('submitReview')"
      />
    </template>
  </UModal>

  <UModal
    v-model:open="announcementOpen"
    :title="announcement.title"
    description="An update from the AUsyon Hub community."
  >
    <template #body>
      <div class="announcement-content">
        <img
          v-if="announcement.imageUrl && !announcementImageFailed"
          :src="announcement.imageUrl"
          :alt="announcement.title"
          class="announcement-thumbnail"
          @error="announcementImageFailed = true"
        >
        <p class="announcement-body">{{ announcement.body }}</p>
      </div>
    </template>
    <template #footer="{ close }">
      <div class="announcement-modal-actions">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-bell-off"
          label="Snooze for 1 day"
          @click="emit('snoozeAnnouncement')"
        />
        <UButton color="primary" variant="solid" icon="i-lucide-x" label="Close" @click="close" />
      </div>
    </template>
  </UModal>
</template>
