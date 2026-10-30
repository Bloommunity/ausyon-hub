import { computed, onMounted, reactive, ref } from 'vue'
import { useColorMode, useHead, useToast } from '#imports'
import { useHubAuth } from '~/composables/useHubAuth'
import { useStoryFilters } from '~/composables/useStoryFilters'
import { createSampleStories } from '~/data/sample-stories'
import { siteAnnouncement } from '~/data/site-announcement'
import { auTypeOptions, auTypes, platformFilters, platformOptions } from '~/data/story-options'
import type { SiteAnnouncement } from '~/types/site-announcement'
import type { Story, StoryReview, StorySubmissionForm } from '~/types/story'

export function useHomePage() {
	const toast = useToast();
	const { supabase, user, signInWithX } = useHubAuth();
	const colorMode = useColorMode();
	const searchQuery = ref("");
	const activeFilter = ref("Everything");
	const activeAuType = ref("Everything");
	const sortMode = ref("Freshly added");
	const showSubmitModal = ref(false);
	const showReviewModal = ref(false);
	const showAnnouncementModal = ref(false);
	const selectedStory = ref<Story | null>(null);
	const expandedReviewsFor = ref<string | null>(null);
	const reviewEntries = ref<StoryReview[]>([]);
	const isLoadingReviews = ref(false);
	const isSubmitting = ref(false);
	const isLoading = ref(false);
	const reviewRating = ref(0);
	const reviewComment = ref("");
	const canUseNativeShare = ref(false);
	const announcement: SiteAnnouncement = siteAnnouncement;
	const storyForm = reactive<StorySubmissionForm>({
		title: "",
		fandom: "",
		platform: "AO3",
		url: "",
		summary: "",
		auType: "",
		tags: "",
	});
	useHead({
		meta: [
			{
				name: "theme-color",
				content: computed(() =>
					colorMode.value === "dark" ? "#101f20" : "#f7f4ec",
				),
			},
		],
	});

	const stories = ref<Story[]>(createSampleStories());
	const currentUserLabel = computed(() => {
		const metadata = user.value?.user_metadata;
		return typeof metadata?.user_name === "string"
			? metadata.user_name
			: typeof metadata?.name === "string"
				? metadata.name
				: "writer";
	});

	const filteredStories = useStoryFilters(
		stories,
		searchQuery,
		activeFilter,
		activeAuType,
		sortMode,
	);
	const topStories = computed(() =>
		[...stories.value]
			.sort((a, b) => b.reviewCount - a.reviewCount)
			.slice(0, 3),
	);

	function isAnnouncementSnoozed(id: string) {
		const key = `ausyon-announcement-snoozed-${id}`;
		try {
			const snoozedUntil = Number(localStorage.getItem(key));
			if (Number.isFinite(snoozedUntil) && snoozedUntil > Date.now()) {
				return true;
			}
			localStorage.removeItem(key);
			return false;
		} catch (error) {
			toast.add({
				title: "Could not check announcement snooze",
				description:
					error instanceof Error
						? error.message
						: "Please check browser storage.",
				color: "error",
			});
			return false;
		}
	}

	function snoozeAnnouncement() {
		try {
			localStorage.setItem(
				`ausyon-announcement-snoozed-${announcement.id}`,
				String(Date.now() + 24 * 60 * 60 * 1000),
			);
			showAnnouncementModal.value = false;
		} catch (error) {
			toast.add({
				title: "Could not snooze announcement",
				description:
					error instanceof Error ? error.message : "Please try again.",
				color: "error",
			});
		}
	}

	onMounted(async () => {
		canUseNativeShare.value = typeof navigator.share === "function";
		showAnnouncementModal.value = !isAnnouncementSnoozed(announcement.id);
		if (!supabase.value) return;
		isLoading.value = true;
		const { data, error } = await supabase.value
			.from("stories")
			.select(
				"id,title,fandom,author,platform,url,summary,tags,review_count,rating,created_at",
			)
			.order("created_at", { ascending: false });
		isLoading.value = false;
		if (error) {
			toast.add({
				title: "Could not load stories",
				description: error.message,
				color: "error",
			});
			return;
		}
		if (data) {
			stories.value = data.map((row) => ({
				id: row.id,
				title: row.title,
				fandom: row.fandom,
				author: row.author,
				platform: row.platform,
				url: row.url,
				summary: row.summary,
				tags: row.tags,
				reviewCount: row.review_count,
				rating: Number(row.rating),
				createdAt: row.created_at,
			}));
		}
	});

	async function requireXLogin() {
		try {
			await signInWithX();
		} catch (error) {
			toast.add({
				title: "Could not sign in with X",
				description:
					error instanceof Error ? error.message : "Please try again.",
				color: "error",
			});
		}
	}

	function requestStorySubmission() {
		if (!user.value) {
			void requireXLogin();
			return;
		}
		showSubmitModal.value = true;
	}

	function openReview(story: Story) {
		if (!user.value) {
			void requireXLogin();
			return;
		}
		selectedStory.value = story;
		reviewRating.value = 0;
		reviewComment.value = "";
		showReviewModal.value = true;
	}

	async function toggleReviewNotes(story: Story) {
		if (expandedReviewsFor.value === story.id) {
			expandedReviewsFor.value = null;
			isLoadingReviews.value = false;
			return;
		}
		expandedReviewsFor.value = story.id;
		reviewEntries.value = [];
		if (!supabase.value) return;

		isLoadingReviews.value = true;
		const { data, error } = await supabase.value
			.from("reviews")
			.select("id,story_id,user_id,author,rating,comment,created_at")
			.eq("story_id", story.id)
			.order("created_at", { ascending: false })
			.limit(20);
		if (expandedReviewsFor.value !== story.id) return;
		isLoadingReviews.value = false;
		if (error) {
			toast.add({
				title: "Could not load reader notes",
				description: error.message,
				color: "error",
			});
			return;
		}
		reviewEntries.value = (data ?? []).map((row) => ({
			id: row.id,
			storyId: row.story_id,
			userId: row.user_id,
			author: row.author,
			rating: row.rating,
			comment: row.comment,
			createdAt: row.created_at,
		}));
	}

	async function submitReview() {
		if (!selectedStory.value || !user.value || !supabase.value) {
			toast.add({
				title: "Reviews need an account",
				description: "Sign in with X and connect Supabase to leave a review.",
				color: "warning",
			});
			return;
		}
		if (!reviewRating.value || reviewComment.value.trim().length < 8) {
			toast.add({
				title: "Add a rating and a little note",
				description:
					"Your review needs a star rating and at least 8 characters.",
				color: "warning",
			});
			return;
		}
		isSubmitting.value = true;
		const { error } = await supabase.value.from("reviews").insert({
			story_id: selectedStory.value.id,
			user_id: user.value.id,
			author: currentUserLabel.value,
			rating: reviewRating.value,
			comment: reviewComment.value.trim(),
		});
		isSubmitting.value = false;
		if (error) {
			toast.add({
				title: "Review could not be saved",
				description: error.message,
				color: "error",
			});
			return;
		}
		selectedStory.value.reviewCount += 1;
		selectedStory.value.rating = Number(
			(
				(selectedStory.value.rating * (selectedStory.value.reviewCount - 1) +
					reviewRating.value) /
				selectedStory.value.reviewCount
			).toFixed(1),
		);
		reviewEntries.value.unshift({
			id: crypto.randomUUID(),
			storyId: selectedStory.value.id,
			userId: user.value.id,
			author: currentUserLabel.value,
			rating: reviewRating.value,
			comment: reviewComment.value.trim(),
			createdAt: new Date().toISOString(),
		});
		showReviewModal.value = false;
		toast.add({
			title: "Your note is in the margins",
			description: "Thanks for leaving this writer a little love.",
			color: "success",
		});
	}

	async function submitStory() {
		if (!user.value) {
			void requireXLogin();
			return;
		}
		if (
			!storyForm.title.trim() ||
			!storyForm.fandom.trim() ||
			!storyForm.url.trim() ||
			!storyForm.summary.trim()
		) {
			toast.add({
				title: "A few details are missing",
				description: "Add a title, fandom, link, and short description.",
				color: "warning",
			});
			return;
		}
		let url: URL;
		try {
			url = new URL(storyForm.url);
			if (!["http:", "https:"].includes(url.protocol))
				throw new Error("URL must start with http or https.");
		} catch {
			toast.add({
				title: "That link does not look right",
				description: "Enter a complete link beginning with https://",
				color: "warning",
			});
			return;
		}
		if (!supabase.value) {
			toast.add({
				title: "Connect Supabase to publish",
				description:
					"Your story is ready, but publishing requires a configured database.",
				color: "warning",
			});
			return;
		}
		const extraTags = storyForm.tags
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);
		const storyTags = [
			...(storyForm.auType ? [storyForm.auType] : []),
			...extraTags.filter(
				(tag) => tag.toLowerCase() !== storyForm.auType.trim().toLowerCase(),
			),
		].slice(0, 5);
		isSubmitting.value = true;
		const { data, error } = await supabase.value
			.from("stories")
			.insert({
				title: storyForm.title.trim(),
				fandom: storyForm.fandom.trim(),
				author: currentUserLabel.value,
				platform: storyForm.platform,
				url: url.toString(),
				summary: storyForm.summary.trim(),
				tags: storyTags,
				user_id: user.value.id,
			})
			.select(
				"id,title,fandom,author,platform,url,summary,tags,review_count,rating,created_at",
			)
			.single();
		isSubmitting.value = false;
		if (error) {
			toast.add({
				title: "Story could not be published",
				description: error.message,
				color: "error",
			});
			return;
		}
		stories.value.unshift({
			id: data.id,
			title: data.title,
			fandom: data.fandom,
			author: data.author,
			platform: data.platform,
			url: data.url,
			summary: data.summary,
			tags: data.tags,
			reviewCount: data.review_count,
			rating: Number(data.rating),
			createdAt: data.created_at,
		});
		showSubmitModal.value = false;
		Object.assign(storyForm, {
			title: "",
			fandom: "",
			platform: "AO3",
			url: "",
			summary: "",
			auType: "",
			tags: "",
		});
		toast.add({
			title: "Your imagined world is on the shelf",
			description: "Readers can step into it and leave a note.",
			color: "success",
		});
	}

	return {
		user, currentUserLabel, requestStorySubmission, stories, searchQuery, sortMode,
		activeFilter, activeAuType, platformFilters, auTypes, filteredStories, isLoading,
		expandedReviewsFor, reviewEntries, isLoadingReviews, supabase, canUseNativeShare,
		openReview, toggleReviewNotes, topStories, showSubmitModal, showReviewModal,
		showAnnouncementModal, reviewRating, reviewComment, storyForm, selectedStory,
		announcement, platformOptions, auTypeOptions, isSubmitting, submitStory,
		submitReview, snoozeAnnouncement
	}
}
