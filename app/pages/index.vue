<script setup lang="ts">
import { useHomePage } from '~/composables/useHomePage'

const {
  user, currentUserLabel, requestStorySubmission, stories, searchQuery, sortMode,
  activeFilter, activeAuType, platformFilters, auTypes, filteredStories, isLoading,
  expandedReviewsFor, reviewEntries, isLoadingReviews, supabase, canUseNativeShare,
  openReview, toggleReviewNotes, topStories, showSubmitModal, showReviewModal,
  showAnnouncementModal, reviewRating, reviewComment, storyForm, selectedStory,
  announcement, platformOptions, auTypeOptions, isSubmitting, submitStory,
  submitReview, snoozeAnnouncement
} = useHomePage()
</script>

<template>
	<div class="min-h-screen">
		<LayoutSiteHeader
			:is-signed-in="Boolean(user)"
			:user-label="currentUserLabel"
			@share="requestStorySubmission"
		/>

		<main>
			<HomeHero @share="requestStorySubmission" />

			<section
				id="discover"
				class="discover-section mx-auto max-w-[1320px] px-5 pb-20 pt-16 sm:px-8 sm:pt-20"
			>
				<div class="section-heading">
					<div>
						<div class="section-kicker">THE WORLD OF WHAT-IFS</div>
						<h2 class="serif">Find a story to <em>step into.</em></h2>
						<p class="section-subtitle">
							Each AU offers another path, another possibility, another world to wander through.
						</p>
					</div>
					<div class="collection-count">
						<span>{{ stories.length.toString().padStart(2, "0") }}</span
						><br />stories & counting
					</div>
				</div>

				<HomeStoryFilters
					v-model:search="searchQuery"
					v-model:sort-mode="sortMode"
					v-model:platform="activeFilter"
					v-model:au-type="activeAuType"
					:platform-filters="platformFilters"
					:au-types="auTypes"
					:result-count="filteredStories.length"
				/>

				<div class="main-layout">
					<div class="story-list">
						<div v-if="isLoading" class="empty-state">
							Opening the story shelves…
						</div>
						<StoriesStoryCard
							v-for="(story, index) in filteredStories"
							:key="story.id"
							:story="story"
							:index="index"
							:expanded="expandedReviewsFor === story.id"
							:reviews="reviewEntries"
							:is-loading-reviews="isLoadingReviews && expandedReviewsFor === story.id"
							:supabase-connected="Boolean(supabase)"
							:can-use-native-share="canUseNativeShare"
							@review="openReview"
							@toggle-reviews="toggleReviewNotes"
						/>
						<div
							v-if="!filteredStories.length && !isLoading"
							class="empty-state"
						>
							<span class="serif">No worlds to wander into just yet.</span>
							<p>
								Try another search, or share the first what-if in this collection.
							</p>
							<UButton
								class="submit-button"
								icon="i-lucide-plus"
								label="Share an AU"
								@click="requestStorySubmission"
							/>
						</div>
					</div>

					<HomeMostLovedShelf :stories="topStories" @share="requestStorySubmission" />
				</div>
			</section>
			<LayoutSiteFooter />
		</main>

		<ModalsStoryDialogs
			v-model:submit-open="showSubmitModal"
			v-model:review-open="showReviewModal"
			v-model:announcement-open="showAnnouncementModal"
			v-model:review-rating="reviewRating"
			v-model:review-comment="reviewComment"
			v-model:story-form="storyForm"
			:selected-story="selectedStory"
			:announcement="announcement"
			:platform-options="platformOptions"
			:au-type-options="auTypeOptions"
			:is-submitting="isSubmitting"
			@submit-story="submitStory"
			@submit-review="submitReview"
			@snooze-announcement="snoozeAnnouncement"
		/>
	</div>
</template>
