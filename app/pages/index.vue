<script setup lang="ts">
	import type { Story, StoryReview } from "~/types/story";

	const toast = useToast();
	const { supabase, user, signInWithX } = useHubAuth();
	const colorMode = useColorMode();
	const searchInput = ref<HTMLInputElement | null>(null);
	const searchQuery = ref("");
	const activeFilter = ref("Everything");
	const sortMode = ref("Freshly added");
	const showSubmitModal = ref(false);
	const showReviewModal = ref(false);
	const selectedStory = ref<Story | null>(null);
	const expandedReviewsFor = ref<string | null>(null);
	const reviewEntries = ref<StoryReview[]>([]);
	const isLoadingReviews = ref(false);
	const mobileMenuOpen = ref(false);
	const isSubmitting = ref(false);
	const isLoading = ref(false);
	const reviewRating = ref(0);
	const reviewComment = ref("");
	const storyForm = reactive({
		title: "",
		fandom: "",
		platform: "AO3",
		url: "",
		summary: "",
		tags: "",
	});
	const platformValues = ["AO3", "Wattpad", "X"];
	const platformFilters = [
		{ label: "Everything", value: "Everything" },
		{ label: "AO3", value: "AO3" },
		{ label: "Wattpad", value: "Wattpad" },
		{ label: "X (formerly Twitter)", value: "X" },
		{ label: "Other", value: "Other" },
	];
	const platformOptions = [
		{ label: "AO3", value: "AO3" },
		{ label: "Wattpad", value: "Wattpad" },
		{ label: "X (formerly Twitter)", value: "X" },
		{ label: "Other", value: "Other" },
	];

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

	const stories = ref<Story[]>([
		{
			id: "1",
			title: "The Stars Between Us",
			fandom: "Stranger Things",
			author: "mossandmoon",
			platform: "AO3",
			url: "https://archiveofourown.org/",
			summary:
				"A small-town radio station, a midnight frequency, and the boy who keeps calling from the other side of the static.",
			tags: ["Coffee shop AU", "Slow burn", "Found family"],
			reviewCount: 128,
			rating: 4.9,
			createdAt: "2026-03-28",
		},
		{
			id: "2",
			title: "A Study in Starlight",
			fandom: "Genshin Impact",
			author: "papercranes",
			platform: "Wattpad",
			url: "https://www.wattpad.com/",
			summary:
				"Two rival astronomers share the same observatory. The sky has other plans for them.",
			tags: ["Academic rivals", "Fluff", "Mutual pining"],
			reviewCount: 96,
			rating: 4.8,
			createdAt: "2026-03-24",
		},
		{
			id: "3",
			title: "Letters from the Last Train",
			fandom: "Jujutsu Kaisen",
			author: "softstatic",
			platform: "AO3",
			url: "https://archiveofourown.org/",
			summary:
				"Every evening, the same train. Every evening, a note left on the seat beside him.",
			tags: ["Soulmates", "Angst with a happy ending", "Letters"],
			reviewCount: 74,
			rating: 4.7,
			createdAt: "2026-03-20",
		},
		{
			id: "4",
			title: "The Florist on Baker Street",
			fandom: "Sherlock",
			author: "inkandivy",
			platform: "X",
			url: "https://x.com/",
			summary:
				"The consulting detective next door claims not to like flowers. The florist knows better.",
			tags: ["Neighbors AU", "Fluff", "Domestic"],
			reviewCount: 62,
			rating: 4.9,
			createdAt: "2026-03-18",
		},
		{
			id: "5",
			title: "Everything in Its Right Place",
			fandom: "Our Flag Means Death",
			author: "seaglass",
			platform: "Other",
			url: "https://example.com/",
			summary:
				"A seaside bookshop, a retired sailor, and one very persistent regular.",
			tags: ["Bookshop AU", "Cozy", "Second chances"],
			reviewCount: 41,
			rating: 4.6,
			createdAt: "2026-03-15",
		},
		{
			id: "6",
			title: "When the Rain Remembers",
			fandom: "BTS",
			author: "lilacseason",
			platform: "AO3",
			url: "https://archiveofourown.org/",
			summary:
				"A shared umbrella becomes a ritual. Neither of them knows who will let go first.",
			tags: ["Idol AU", "Slow burn", "Comfort"],
			reviewCount: 35,
			rating: 4.8,
			createdAt: "2026-03-12",
		},
	]);
	const currentUserLabel = computed(() => {
		const metadata = user.value?.user_metadata;
		return typeof metadata?.user_name === "string"
			? metadata.user_name
			: typeof metadata?.name === "string"
				? metadata.name
				: "writer";
	});

	defineShortcuts({
		meta_k: () => searchInput.value?.focus(),
	});

	const filteredStories = computed(() => {
		const query = searchQuery.value.trim().toLowerCase();
		const filtered = stories.value.filter((story) => {
			const matchesPlatform =
				activeFilter.value === "Everything" ||
				(activeFilter.value === "Other"
					? !platformValues.includes(story.platform)
					: story.platform === activeFilter.value);
			const searchable = [
				story.title,
				story.fandom,
				story.author,
				story.summary,
				...story.tags,
			]
				.join(" ")
				.toLowerCase();
			return matchesPlatform && (!query || searchable.includes(query));
		});
		return filtered.sort((a, b) =>
			sortMode.value === "Most reviewed"
				? b.reviewCount - a.reviewCount
				: new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	});
	const topStories = computed(() =>
		[...stories.value]
			.sort((a, b) => b.reviewCount - a.reviewCount)
			.slice(0, 3),
	);
	const initials = (author: string) => author.slice(0, 1).toUpperCase();

	onMounted(async () => {
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
				tags: storyForm.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean)
					.slice(0, 5),
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
			tags: "",
		});
		toast.add({
			title: "Your AU is on the shelf",
			description: "The community can find and review it now.",
			color: "success",
		});
	}

	function formatRelativeDate(date: string) {
		const days = Math.max(
			0,
			Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000),
		);
		if (days === 0) return "today";
		if (days === 1) return "yesterday";
		return `${days} days ago`;
	}
</script>

<template>
	<div class="min-h-screen">
		<header class="site-header">
			<div
				class="mx-auto flex h-[82px] max-w-[1320px] items-center justify-between px-5 sm:px-8"
			>
				<a href="#" class="brand-lockup" aria-label="AUsyon Hub home">
					<img
						src="/assets/ausyon-hub-word-logo.png"
						alt="AUsyon Hub"
						class="brand-word-logo"
					/>
				</a>
				<nav
					class="hidden items-center gap-8 md:flex"
					aria-label="Main navigation"
				>
					<a class="nav-link nav-link-active" href="#discover">Discover</a>
					<a class="nav-link" href="#most-loved">Most loved</a>
					<a class="nav-link" href="#about">Our little corner</a>
				</nav>
				<div class="hidden items-center gap-3 md:flex">
					<ClientOnly>
						<UColorModeButton aria-label="Toggle dark mode" />
					</ClientOnly>
					<UButton
						v-if="user"
						color="neutral"
						variant="ghost"
						icon="i-lucide-user-round"
						:label="currentUserLabel"
					/>
					<UButton
						v-else
						color="neutral"
						variant="ghost"
						icon="i-simple-icons-x"
						label="Sign in"
						@click="requireXLogin"
					/>
					<UButton
						class="submit-button"
						icon="i-lucide-plus"
						label="Share an AU"
						@click="requestStorySubmission"
					/>
				</div>
				<div class="flex items-center gap-2 md:hidden">
					<ClientOnly>
						<UColorModeButton aria-label="Toggle dark mode" />
						<template #fallback
							><span class="color-mode-placeholder"></span
						></template>
					</ClientOnly>
					<button
						class="mobile-menu-button"
						:aria-expanded="mobileMenuOpen"
						aria-label="Toggle navigation"
						@click="mobileMenuOpen = !mobileMenuOpen"
					>
						<UIcon
							:name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
							class="size-5"
						/>
					</button>
				</div>
			</div>
			<div v-if="mobileMenuOpen" class="mobile-menu md:hidden">
				<a href="#discover" @click="mobileMenuOpen = false">Discover</a>
				<a href="#most-loved" @click="mobileMenuOpen = false">Most loved</a>
				<a href="#about" @click="mobileMenuOpen = false">Our little corner</a>
				<UButton
					block
					color="neutral"
					variant="outline"
					icon="i-simple-icons-x"
					label="Sign in with X"
					@click="requireXLogin"
				/>
				<UButton
					block
					class="submit-button"
					icon="i-lucide-plus"
					label="Share an AU"
					@click="requestStorySubmission"
				/>
			</div>
		</header>

		<main>
			<section
				class="hero-shell mx-auto max-w-[1320px] px-5 pt-8 sm:px-8 sm:pt-12"
			>
				<div class="hero-paper paper-grain">
					<div class="hero-copy">
						<div class="eyebrow">
							<span class="eyebrow-star">✳</span> A community-made reading nook
						</div>
						<h1 class="serif">
							Every universe<br />has
							<span class="hero-underline">another story.</span>
						</h1>
						<p class="hero-description">
							A little corner of the internet to find, share, and leave some
							love for alternate universe stories from all over.
						</p>
						<div class="hero-actions">
							<a href="#discover" class="hero-cta"
								>Find your next AU
								<UIcon name="i-lucide-arrow-down-right" class="size-4"
							/></a>
							<button class="hero-secondary" @click="requestStorySubmission">
								<UIcon name="i-lucide-feather" class="size-[17px]" /> Leave one
								on the shelf
							</button>
						</div>
						<div class="hero-note">
							<span class="note-dash">—</span> built by readers, for readers
						</div>
					</div>
					<div class="hero-art" aria-hidden="true">
						<div class="sun-disc"></div>
						<div class="orbit orbit-one"></div>
						<div class="orbit orbit-two"></div>
						<div class="art-star star-one">✦</div>
						<div class="art-star star-two">✳</div>
						<div class="art-star star-three">✧</div>
						<div class="open-book">
							<div class="book-page book-page-left">
								<span></span><span></span><span></span><span></span>
							</div>
							<div class="book-page book-page-right">
								<span></span><span></span><span></span><span></span>
							</div>
							<div class="book-shadow"></div>
						</div>
						<div class="art-caption">
							a story is a door<br />to somewhere else
						</div>
					</div>
					<div class="hero-bottom-rule"></div>
					<div class="hero-index">
						VOL. 01 <span>·</span> THE INFINITE SHELF
					</div>
				</div>
				<div class="ticker-row">
					<span>FANDOM IS A LOVE LANGUAGE</span><i>✳</i
					><span>EVERY AU HAS A HOME HERE</span><i>✳</i
					><span>READ SOMETHING A LITTLE DIFFERENT</span>
				</div>
			</section>

			<section
				id="discover"
				class="discover-section mx-auto max-w-[1320px] px-5 pb-20 pt-16 sm:px-8 sm:pt-20"
			>
				<div class="section-heading">
					<div>
						<div class="section-kicker">THE COMMUNITY BOOKSHELF</div>
						<h2 class="serif">Find a story to <em>fall into.</em></h2>
						<p class="section-subtitle">
							A few doors into other worlds, picked by the people who love them.
						</p>
					</div>
					<div class="collection-count">
						<span>{{ stories.length.toString().padStart(2, "0") }}</span
						><br />stories & counting
					</div>
				</div>

				<div class="discovery-toolbar">
					<div class="search-wrap">
						<UIcon name="i-lucide-search" class="search-icon size-[18px]" />
						<input
							ref="searchInput"
							v-model="searchQuery"
							type="search"
							aria-label="Search stories"
							placeholder="Search a fandom, trope, or feeling..."
							class="search-input"
						/>
						<kbd>⌘ K</kbd>
					</div>
					<label class="sort-control">
						<span>Sort by</span>
						<select v-model="sortMode" aria-label="Sort stories">
							<option>Freshly added</option>
							<option>Most reviewed</option>
						</select>
						<UIcon name="i-lucide-chevron-down" class="size-4" />
					</label>
				</div>

				<div class="filter-row">
					<div class="platform-filters" aria-label="Filter by platform">
						<button
							v-for="filter in platformFilters"
							:key="filter.value"
							class="filter-chip"
							:class="{ 'filter-chip-active': activeFilter === filter.value }"
							@click="activeFilter = filter.value"
						>
							{{ filter.label }}
						</button>
					</div>
					<span class="results-label"
						>{{ filteredStories.length }} stories found</span
					>
				</div>

				<div class="main-layout">
					<div class="story-list">
						<div v-if="isLoading" class="empty-state">
							Opening the story shelves…
						</div>
						<article
							v-for="(story, index) in filteredStories"
							:key="story.id"
							class="story-card"
							:class="{ 'story-card-featured': index === 0 }"
						>
							<div class="story-topline">
								<span class="platform-label"
									><span
										class="platform-dot"
										:class="`platform-dot-${story.platform.toLowerCase()}`"
									></span
									>{{
										story.platform === "X"
											? "X (formerly Twitter)"
											: story.platform
									}}</span
								>
								<span class="story-date"
									>Added {{ formatRelativeDate(story.createdAt) }}</span
								>
							</div>
							<div class="story-content">
								<div class="story-copy">
									<div class="fandom-label">{{ story.fandom }}</div>
									<a
										:href="story.url"
										target="_blank"
										rel="noopener noreferrer"
										class="story-title serif"
										>{{ story.title }}
										<UIcon
											name="i-lucide-arrow-up-right"
											class="story-external"
									/></a>
									<p class="story-summary">{{ story.summary }}</p>
									<div class="story-tags">
										<span v-for="tag in story.tags" :key="tag">{{ tag }}</span>
									</div>
								</div>
								<div class="story-aside">
									<div class="rating-mark">
										<span>✦</span> {{ story.rating.toFixed(1) }}
									</div>
									<div class="review-count">
										<strong>{{ story.reviewCount }}</strong
										><br />little notes
									</div>
								</div>
							</div>
							<div class="story-footer">
								<div class="author-lockup">
									<span class="author-avatar">{{
										initials(story.author)
									}}</span>
									<span
										>by <strong>{{ story.author }}</strong></span
									>
								</div>
								<div class="story-actions">
									<button
										class="review-link read-notes-link"
										@click="toggleReviewNotes(story)"
									>
										<UIcon name="i-lucide-messages-square" class="size-4" />
										{{
											expandedReviewsFor === story.id
												? "Hide notes"
												: `Read ${story.reviewCount} notes`
										}}
									</button>
									<button class="review-link" @click="openReview(story)">
										<UIcon name="i-lucide-message-square-text" class="size-4" />
										Leave a review
										<UIcon name="i-lucide-arrow-right" class="size-3.5" />
									</button>
								</div>
							</div>
							<div v-if="expandedReviewsFor === story.id" class="reader-notes">
								<div class="reader-notes-heading">
									<span class="serif">Notes in the margins</span
									><span>{{ story.reviewCount }} reviews</span>
								</div>
								<p v-if="isLoadingReviews" class="reader-notes-empty">
									Opening the notes…
								</p>
								<p v-else-if="!supabase" class="reader-notes-empty">
									Connect Supabase to open and add the community’s notes.
								</p>
								<p v-else-if="!reviewEntries.length" class="reader-notes-empty">
									No notes yet. Be the first to leave one.
								</p>
								<template v-else>
									<article
										v-for="note in reviewEntries"
										:key="note.id"
										class="reader-note"
									>
										<div class="reader-note-meta">
											<strong>{{ note.author }}</strong
											><span
												><span class="note-stars">✦</span> {{ note.rating }} /
												5</span
											>
										</div>
										<p>{{ note.comment }}</p>
									</article>
								</template>
							</div>
						</article>
						<div
							v-if="!filteredStories.length && !isLoading"
							class="empty-state"
						>
							<span class="serif">No stories on this page yet.</span>
							<p>
								Try another search, or be the first to leave one on the shelf.
							</p>
							<UButton
								class="submit-button"
								icon="i-lucide-plus"
								label="Share an AU"
								@click="requestStorySubmission"
							/>
						</div>
					</div>

					<aside id="most-loved" class="sidebar">
						<div class="most-loved-card">
							<div class="sidebar-kicker"><span>✳</span> reader favorites</div>
							<h3 class="serif">Most <em>loved</em></h3>
							<p class="sidebar-description">
								The stories with the most notes in the margins.
							</p>
							<a
								v-for="(story, index) in topStories"
								:key="story.id"
								:href="story.url"
								target="_blank"
								rel="noopener noreferrer"
								class="top-story"
							>
								<span class="top-rank">0{{ index + 1 }}</span>
								<span class="top-story-info"
									><strong class="serif">{{ story.title }}</strong
									><small>{{ story.fandom }}</small></span
								>
								<span class="top-count"
									><UIcon name="i-lucide-heart" class="size-3" />{{
										story.reviewCount
									}}</span
								>
							</a>
							<a href="#discover" class="see-all"
								>See all stories
								<UIcon name="i-lucide-arrow-up-right" class="size-3.5"
							/></a>
						</div>
						<div class="shelf-note paper-grain">
							<span class="note-illustration">“</span>
							<p class="serif">
								Somewhere, someone is writing the story you didn’t know you
								needed.
							</p>
							<span class="note-credit">A LITTLE REMINDER FROM US</span>
							<span class="note-spark">✳</span>
						</div>
						<div class="submit-prompt">
							<div class="prompt-icon">
								<UIcon name="i-lucide-book-heart" class="size-5" />
							</div>
							<div>
								<strong>Have one to share?</strong>
								<p>Give your favorite AU a little more love.</p>
							</div>
							<button
								aria-label="Share a story"
								@click="requestStorySubmission"
							>
								<UIcon name="i-lucide-arrow-up-right" class="size-4" />
							</button>
						</div>
					</aside>
				</div>
			</section>
			<section id="about" class="about-strip">
				<div
					class="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row sm:px-8"
				>
					<div class="about-brand">
						<img src="/assets/logo-icon.png" alt="" class="about-logo" /><span
							class="serif"
							>A little corner for <em>everywhere else.</em></span
						>
					</div>
					<p>Made with care for the worlds we make together. <span>✳</span></p>
					<a href="#discover">Back to the shelf ↑</a>
				</div>
			</section>
		</main>

		<UModal
			v-model:open="showSubmitModal"
			title="Leave one on the shelf"
			description="Share a link to an AU you love."
		>
			<template #body>
				<div class="modal-intro">
					<span class="modal-spark">✳</span>
					<p>A good story deserves to be found.</p>
				</div>
				<div class="modal-form">
					<UFormField label="Story title" required
						><UInput
							v-model="storyForm.title"
							maxlength="160"
							placeholder="The name on the cover"
							class="w-full"
					/></UFormField>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<UFormField label="Fandom" required
							><UInput
								v-model="storyForm.fandom"
								maxlength="120"
								placeholder="Where does it take place?"
								class="w-full"
						/></UFormField>
						<UFormField label="Platform"
							><USelect
								v-model="storyForm.platform"
								:items="platformOptions"
								class="w-full"
						/></UFormField>
					</div>
					<UFormField label="Story link" required
						><UInput
							v-model="storyForm.url"
							type="url"
							placeholder="https://..."
							icon="i-lucide-link"
							class="w-full"
					/></UFormField>
					<UFormField label="A little about it" required
						><UTextarea
							v-model="storyForm.summary"
							maxlength="600"
							:rows="3"
							placeholder="No spoilers, just a little invitation..."
							class="w-full"
					/></UFormField>
					<UFormField label="Tags" hint="Optional · comma separated"
						><UInput
							v-model="storyForm.tags"
							placeholder="Slow burn, coffee shop AU..."
							class="w-full"
					/></UFormField>
				</div>
			</template>
			<template #footer="{ close }">
				<UButton
					color="neutral"
					variant="outline"
					label="Maybe later"
					@click="close"
				/>
				<UButton
					class="submit-button"
					:loading="isSubmitting"
					icon="i-lucide-sparkles"
					label="Add to the shelf"
					@click="submitStory"
				/>
			</template>
		</UModal>

		<UModal
			v-model:open="showReviewModal"
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
							@click="reviewRating = star"
						>
							<UIcon
								:name="star <= reviewRating ? 'i-lucide-star' : 'i-lucide-star'"
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
				<UButton
					color="neutral"
					variant="outline"
					label="Cancel"
					@click="close"
				/>
				<UButton
					class="submit-button"
					:loading="isSubmitting"
					icon="i-lucide-send"
					label="Leave my note"
					@click="submitReview"
				/>
			</template>
		</UModal>
	</div>
</template>

<style scoped>
	.site-header {
		position: relative;
		z-index: 20;
		border-bottom: 1px solid rgb(23 59 61 / 9%);
		background: rgb(247 244 236 / 88%);
		backdrop-filter: blur(14px);
	}
	.brand-lockup {
		display: flex;
		align-items: center;
		gap: 9px;
		color: var(--color-ink);
		text-decoration: none;
	}
	.brand-logo {
		width: 47px;
		height: 47px;
		object-fit: contain;
	}
	.brand-word-logo {
		width: 150px;
		height: 38px;
		object-fit: contain;
	}
	.nav-link {
		position: relative;
		color: #647576;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.01em;
		text-decoration: none;
		transition: color 0.2s;
	}
	.nav-link:hover,
	.nav-link-active {
		color: var(--color-ink);
	}
	.nav-link-active::after {
		position: absolute;
		right: 0;
		bottom: -8px;
		left: 0;
		height: 1px;
		background: var(--color-coral);
		content: "";
	}
	.submit-button {
		border: 0 !important;
		color: #fff !important;
		background: var(--color-teal) !important;
		box-shadow: 0 3px 8px rgb(23 59 61 / 11%);
	}
	.submit-button:hover {
		background: #1d6667 !important;
	}
	.mobile-menu-button {
		display: grid;
		width: 42px;
		height: 42px;
		place-items: center;
		border: 1px solid var(--color-line);
		border-radius: 50%;
		color: var(--color-ink);
	}
	.mobile-menu {
		display: grid;
		gap: 12px;
		padding: 8px 20px 20px;
		border-top: 1px solid var(--color-line);
		background: var(--color-paper);
	}
	.mobile-menu > a {
		padding: 8px 0;
		color: var(--color-ink);
		font-size: 14px;
		text-decoration: none;
	}
	.hero-paper {
		position: relative;
		display: grid;
		min-height: 430px;
		grid-template-columns: 1.08fr 0.92fr;
		overflow: hidden;
		border: 1px solid #e8e1d3;
		border-radius: 3px;
		background-color: #eee9dc;
		background-blend-mode: soft-light;
		box-shadow: 0 12px 35px rgb(50 52 42 / 5%);
	}
	.hero-paper::after {
		position: absolute;
		inset: 0;
		z-index: 0;
		background: linear-gradient(
			113deg,
			rgb(255 254 248 / 54%),
			rgb(247 244 236 / 15%)
		);
		content: "";
		pointer-events: none;
	}
	.hero-copy {
		position: relative;
		z-index: 1;
		align-self: center;
		padding: 60px 0 75px 8.5%;
	}
	.eyebrow,
	.section-kicker,
	.sidebar-kicker {
		color: #6b7774;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.17em;
		text-transform: uppercase;
	}
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.eyebrow-star {
		color: var(--color-coral);
		font-size: 15px;
	}
	.hero-copy h1 {
		margin: 24px 0 13px;
		color: #173b3d;
		font-size: clamp(42px, 5.3vw, 68px);
		font-weight: 500;
		letter-spacing: -0.065em;
		line-height: 0.99;
	}
	.hero-underline {
		position: relative;
		color: var(--color-teal);
		font-style: italic;
		white-space: nowrap;
	}
	.hero-underline::after {
		position: absolute;
		right: 0;
		bottom: -4px;
		left: 4px;
		height: 5px;
		background: url("data:image/svg+xml,%3Csvg width='200' height='8' viewBox='0 0 200 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 6C51 2 146 1 199 4' stroke='%23d0785f' stroke-width='2' fill='none'/%3E%3C/svg%3E")
			center/100% 100% no-repeat;
		content: "";
	}
	.hero-description {
		max-width: 425px;
		margin: 25px 0 24px;
		color: #617172;
		font-size: 13px;
		line-height: 1.85;
	}
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 23px;
	}
	.hero-cta {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 14px;
		padding: 0 17px;
		border-radius: 2px;
		color: white;
		background: var(--color-ink);
		font-size: 11px;
		font-weight: 600;
		text-decoration: none;
		transition:
			transform 0.2s,
			background 0.2s;
	}
	.hero-cta:hover {
		transform: translateY(-2px);
		background: var(--color-teal);
	}
	.hero-secondary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 0;
		color: var(--color-ink-soft);
		background: transparent;
		font-size: 11px;
		font-weight: 600;
	}
	.hero-note {
		margin-top: 30px;
		color: #83908b;
		font-size: 9px;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.note-dash {
		margin-right: 7px;
		color: var(--color-coral);
	}
	.hero-art {
		position: relative;
		z-index: 1;
		min-height: 390px;
		overflow: hidden;
	}
	.sun-disc {
		position: absolute;
		top: 50px;
		left: 50%;
		width: 290px;
		height: 290px;
		transform: translateX(-49%);
		border: 1px solid rgb(40 124 123 / 14%);
		border-radius: 50%;
		background: radial-gradient(
			circle at 50% 45%,
			rgb(232 187 100 / 35%),
			rgb(232 187 100 / 11%) 54%,
			transparent 55%
		);
	}
	.orbit {
		position: absolute;
		top: 60px;
		left: 50%;
		width: 365px;
		height: 225px;
		transform: translateX(-50%) rotate(-26deg);
		border: 1px solid rgb(40 124 123 / 20%);
		border-radius: 50%;
	}
	.orbit-two {
		top: 96px;
		width: 300px;
		height: 205px;
		transform: translateX(-50%) rotate(31deg);
		border-color: rgb(208 120 95 / 29%);
	}
	.open-book {
		position: absolute;
		top: 154px;
		left: 50%;
		display: flex;
		width: 250px;
		height: 139px;
		transform: translateX(-50%) rotate(-5deg);
		filter: drop-shadow(0 13px 10px rgb(23 59 61 / 14%));
	}
	.book-page {
		position: relative;
		display: flex;
		width: 50%;
		flex-direction: column;
		justify-content: center;
		gap: 11px;
		padding: 23px 20px;
		border: 1px solid #d5c9ad;
		background: #fffdf6;
	}
	.book-page-left {
		border-radius: 8px 3px 2px 6px;
		transform: skewY(4deg);
		transform-origin: right center;
	}
	.book-page-right {
		border-radius: 3px 8px 6px 2px;
		transform: skewY(-4deg);
		transform-origin: left center;
	}
	.book-page span {
		display: block;
		height: 1px;
		background: #d6ccba;
	}
	.book-page span:nth-child(2) {
		width: 83%;
	}
	.book-page span:nth-child(3) {
		width: 70%;
	}
	.book-page span:nth-child(4) {
		width: 91%;
	}
	.book-shadow {
		position: absolute;
		top: 2px;
		left: 50%;
		width: 2px;
		height: 137px;
		background: #c4b79b;
	}
	.art-star {
		position: absolute;
		color: var(--color-coral);
	}
	.star-one {
		top: 99px;
		left: 19%;
		font-size: 24px;
	}
	.star-two {
		top: 169px;
		right: 13%;
		color: var(--color-teal);
		font-size: 26px;
	}
	.star-three {
		right: 23%;
		bottom: 69px;
		color: #c59a47;
		font-size: 21px;
	}
	.art-caption {
		position: absolute;
		right: 17%;
		bottom: 30px;
		color: #75827d;
		font-family: var(--font-serif);
		font-size: 12px;
		font-style: italic;
		line-height: 1.4;
		text-align: right;
		transform: rotate(-4deg);
	}
	.hero-bottom-rule {
		position: absolute;
		right: 8.5%;
		bottom: 22px;
		left: 8.5%;
		z-index: 1;
		height: 1px;
		background: rgb(23 59 61 / 13%);
	}
	.hero-index {
		position: absolute;
		right: 8.5%;
		bottom: 7px;
		z-index: 2;
		color: #89928b;
		font-size: 7px;
		letter-spacing: 0.14em;
	}
	.hero-index span {
		padding: 0 5px;
		color: var(--color-coral);
	}
	.ticker-row {
		display: flex;
		min-height: 49px;
		align-items: center;
		justify-content: center;
		gap: clamp(14px, 3vw, 40px);
		overflow: hidden;
		border-bottom: 1px solid var(--color-line);
		color: #7b8882;
		white-space: nowrap;
	}
	.ticker-row span {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.16em;
	}
	.ticker-row i {
		color: var(--color-coral);
		font-size: 12px;
		font-style: normal;
	}
	.section-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 25px;
		margin-bottom: 28px;
	}
	.section-kicker {
		color: var(--color-coral);
	}
	.section-heading h2 {
		margin: 10px 0 5px;
		font-size: clamp(33px, 4vw, 46px);
		font-weight: 500;
		letter-spacing: -0.055em;
		line-height: 1.05;
	}
	.section-heading h2 em {
		color: var(--color-teal);
		font-weight: 400;
	}
	.section-subtitle {
		margin: 10px 0 0;
		color: #74817e;
		font-size: 12px;
	}
	.collection-count {
		min-width: 90px;
		padding: 0 0 4px 19px;
		border-left: 1px solid #ded7c9;
		color: #81908a;
		font-size: 9px;
		line-height: 1.7;
	}
	.collection-count span {
		color: var(--color-ink);
		font-family: var(--font-serif);
		font-size: 23px;
	}
	.discovery-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		padding: 12px 0;
		border-top: 1px solid var(--color-line);
		border-bottom: 1px solid var(--color-line);
	}
	.search-wrap {
		position: relative;
		display: flex;
		max-width: 520px;
		flex: 1;
		align-items: center;
		gap: 12px;
	}
	.search-icon {
		flex-shrink: 0;
		color: #87918a;
	}
	.search-input {
		width: 100%;
		padding: 7px 0;
		outline: 0;
		color: var(--color-ink);
		background: transparent;
		font-size: 12px;
	}
	.search-input::placeholder {
		color: #a0a9a2;
	}
	.search-wrap kbd {
		padding: 4px 7px;
		border: 1px solid #e2dccf;
		border-radius: 3px;
		color: #89938e;
		font-size: 9px;
		white-space: nowrap;
	}
	.sort-control {
		display: flex;
		align-items: center;
		gap: 9px;
		color: #82908a;
		font-size: 10px;
		white-space: nowrap;
	}
	.sort-control select {
		appearance: none;
		padding: 8px 0;
		outline: 0;
		color: var(--color-ink);
		background: transparent;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
	}
	.sort-control svg {
		margin-left: -6px;
		pointer-events: none;
	}
	.filter-row {
		display: flex;
		min-height: 57px;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.platform-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
	}
	.filter-chip {
		padding: 7px 12px;
		border: 1px solid transparent;
		border-radius: 99px;
		color: #788580;
		background: transparent;
		font-size: 10px;
		font-weight: 600;
		transition: 0.18s ease;
	}
	.filter-chip:hover {
		border-color: #dcd5c7;
		color: var(--color-ink);
	}
	.filter-chip-active {
		border-color: #d5e2dc;
		color: #276c68;
		background: #e6eee8;
	}
	.results-label {
		color: #9aa39c;
		font-size: 9px;
		white-space: nowrap;
	}
	.main-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 275px;
		gap: 32px;
		align-items: start;
	}
	.story-list {
		display: grid;
		gap: 12px;
	}
	.story-card {
		padding: 19px 21px 0;
		border: 1px solid #e7e0d3;
		border-radius: 3px;
		background: rgb(255 254 250 / 65%);
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			transform 0.2s;
	}
	.story-card:hover {
		transform: translateY(-2px);
		border-color: #d4dfd8;
		box-shadow: 0 9px 24px rgb(37 63 58 / 5%);
	}
	.story-card-featured {
		border-left: 2px solid #6fa7a0;
	}
	.story-topline,
	.story-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.platform-label {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		color: #617572;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.platform-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #7b9692;
	}
	.platform-dot-ao3 {
		background: #bc675c;
	}
	.platform-dot-wattpad {
		background: #ed804c;
	}
	.platform-dot-x {
		background: #1d2928;
	}
	.story-date {
		color: #a1a99f;
		font-size: 9px;
	}
	.story-content {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 16px 0 15px;
	}
	.story-copy {
		min-width: 0;
	}
	.fandom-label {
		color: var(--color-coral);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.story-title {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		margin-top: 5px;
		color: var(--color-ink);
		font-size: 22px;
		font-weight: 500;
		letter-spacing: -0.04em;
		line-height: 1.2;
		text-decoration: none;
	}
	.story-title:hover {
		color: var(--color-teal);
	}
	.story-external {
		width: 13px;
		height: 13px;
		color: #8d9991;
		opacity: 0;
		transition: opacity 0.2s;
	}
	.story-title:hover .story-external {
		opacity: 1;
	}
	.story-summary {
		max-width: 670px;
		margin: 7px 0 12px;
		color: #74817e;
		font-size: 11px;
		line-height: 1.7;
	}
	.story-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.story-tags span {
		padding: 5px 8px;
		border-radius: 2px;
		color: #73817a;
		background: #f0eee6;
		font-size: 8px;
		font-weight: 600;
	}
	.story-aside {
		display: flex;
		min-width: 64px;
		flex-direction: column;
		align-items: end;
		justify-content: start;
		gap: 9px;
		padding-top: 4px;
	}
	.rating-mark {
		color: #64746e;
		font-size: 10px;
		font-weight: 700;
	}
	.rating-mark span {
		margin-right: 2px;
		color: #d5a74e;
	}
	.review-count {
		color: #9aa39b;
		font-size: 8px;
		line-height: 1.65;
		text-align: right;
	}
	.review-count strong {
		color: var(--color-ink);
		font-family: var(--font-serif);
		font-size: 18px;
		font-weight: 500;
	}
	.story-footer {
		min-height: 47px;
		border-top: 1px solid #eee9df;
	}
	.story-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.read-notes-link {
		color: #8a9690;
	}
	.reader-notes {
		padding: 14px 0 16px;
		border-top: 1px solid #eee9df;
	}
	.reader-notes-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
		color: #7d8b84;
		font-size: 8px;
	}
	.reader-notes-heading .serif {
		color: #48635e;
		font-size: 15px;
		font-style: italic;
	}
	.reader-notes-empty {
		margin: 0;
		color: #8d9991;
		font-size: 10px;
	}
	.reader-note {
		padding: 10px 0;
		border-top: 1px solid #f0ece4;
	}
	.reader-note-meta {
		display: flex;
		justify-content: space-between;
		color: #77877f;
		font-size: 9px;
	}
	.reader-note-meta strong {
		color: #536b64;
	}
	.note-stars {
		color: #d2a74e;
	}
	.reader-note p {
		margin: 6px 0 0;
		color: #687873;
		font-size: 10px;
		line-height: 1.65;
	}
	.author-lockup {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #8a9690;
		font-size: 9px;
	}
	.author-lockup strong {
		color: #566a66;
		font-weight: 600;
	}
	.author-avatar {
		display: grid;
		width: 22px;
		height: 22px;
		place-items: center;
		border-radius: 50%;
		color: #53746d;
		background: #e3ebe3;
		font-family: var(--font-serif);
		font-size: 10px;
	}
	.review-link {
		display: flex;
		align-items: center;
		gap: 6px;
		color: #527b73;
		background: transparent;
		font-size: 9px;
		font-weight: 700;
		transition: color 0.2s;
	}
	.review-link:hover {
		color: var(--color-coral);
	}
	.sidebar {
		display: grid;
		gap: 14px;
	}
	.most-loved-card {
		padding: 20px 18px 15px;
		border: 1px solid #e7e0d3;
		background: #f1eee5;
	}
	.sidebar-kicker {
		display: flex;
		align-items: center;
		gap: 7px;
		color: #8d9387;
		font-size: 8px;
	}
	.sidebar-kicker span {
		color: var(--color-coral);
		font-size: 13px;
	}
	.most-loved-card h3 {
		margin: 12px 0 4px;
		color: var(--color-ink);
		font-size: 25px;
		font-weight: 500;
		letter-spacing: -0.04em;
	}
	.most-loved-card h3 em {
		color: var(--color-teal);
		font-weight: 400;
	}
	.sidebar-description {
		margin: 0 0 12px;
		color: #85908a;
		font-size: 9px;
		line-height: 1.6;
	}
	.top-story {
		display: flex;
		min-height: 58px;
		align-items: center;
		gap: 10px;
		border-top: 1px solid #e2dccf;
		color: inherit;
		text-decoration: none;
	}
	.top-rank {
		color: #bf8971;
		font-family: var(--font-serif);
		font-size: 15px;
		font-style: italic;
	}
	.top-story-info {
		display: grid;
		min-width: 0;
		flex: 1;
		gap: 3px;
	}
	.top-story-info strong {
		overflow: hidden;
		color: #335052;
		font-size: 12px;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.top-story-info small {
		color: #8d9991;
		font-size: 8px;
	}
	.top-count {
		display: flex;
		align-items: center;
		gap: 4px;
		color: #a36c5e;
		font-size: 9px;
	}
	.see-all {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 11px;
		color: #557a72;
		font-size: 9px;
		font-weight: 700;
		text-decoration: none;
	}
	.shelf-note {
		position: relative;
		min-height: 157px;
		overflow: hidden;
		padding: 17px 19px;
		border: 1px solid #e9dcc3;
		background-color: #f1e7d4;
		background-blend-mode: soft-light;
	}
	.shelf-note::after {
		position: absolute;
		inset: 0;
		background: rgb(241 231 212 / 69%);
		content: "";
		pointer-events: none;
	}
	.shelf-note > * {
		position: relative;
		z-index: 1;
	}
	.note-illustration {
		display: block;
		height: 25px;
		color: #c59069;
		font-family: var(--font-serif);
		font-size: 38px;
		line-height: 1;
	}
	.shelf-note p {
		max-width: 195px;
		margin: 7px 0 14px;
		color: #66756d;
		font-size: 16px;
		font-style: italic;
		line-height: 1.35;
	}
	.note-credit {
		color: #9b937f;
		font-size: 7px;
		font-weight: 700;
		letter-spacing: 0.14em;
	}
	.note-spark {
		position: absolute;
		right: 19px;
		bottom: 10px;
		color: #ca956c;
		font-size: 22px;
	}
	.submit-prompt {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 13px;
		border: 1px dashed #d8d1c4;
	}
	.prompt-icon {
		display: grid;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		place-items: center;
		border-radius: 50%;
		color: #4c8276;
		background: #e5eee7;
	}
	.submit-prompt > div:nth-child(2) {
		flex: 1;
	}
	.submit-prompt strong {
		color: #52635f;
		font-size: 10px;
	}
	.submit-prompt p {
		margin: 3px 0 0;
		color: #929b93;
		font-size: 8px;
		line-height: 1.5;
	}
	.submit-prompt > button {
		color: #789087;
		background: transparent;
	}
	.empty-state {
		display: grid;
		min-height: 180px;
		place-content: center;
		justify-items: center;
		gap: 8px;
		border: 1px dashed #d8d1c4;
		color: #73817a;
		text-align: center;
	}
	.empty-state .serif {
		color: var(--color-ink);
		font-size: 20px;
	}
	.empty-state p {
		margin: 0 0 5px;
		font-size: 11px;
	}
	.about-strip {
		border-top: 1px solid #e5ded2;
		background: #f0ece2;
	}
	.about-brand {
		display: flex;
		align-items: center;
		gap: 11px;
		color: #62726d;
		font-size: 16px;
	}
	.about-brand em {
		color: var(--color-teal);
	}
	.about-logo {
		width: 42px;
		height: 42px;
		object-fit: contain;
	}
	.about-strip p,
	.about-strip a {
		color: #88938a;
		font-size: 9px;
		text-decoration: none;
	}
	.about-strip p span {
		padding-left: 4px;
		color: var(--color-coral);
	}
	.about-strip a:hover {
		color: var(--color-teal);
	}
	.modal-intro {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 16px;
		padding: 10px 12px;
		background: #f4f1e8;
	}
	.modal-spark {
		color: var(--color-coral);
	}
	.modal-intro p {
		margin: 0;
		color: #6b7b74;
		font-family: var(--font-serif);
		font-size: 14px;
		font-style: italic;
	}
	.modal-form {
		display: grid;
		gap: 15px;
	}
	.review-modal-story {
		margin-bottom: 20px;
		padding: 12px 14px;
		border-left: 2px solid #83aaa0;
		background: #f4f1e8;
	}
	.review-modal-story p {
		margin: 4px 0 0;
		color: var(--color-ink);
		font-size: 19px;
	}
	.rating-picker {
		display: grid;
		gap: 7px;
		margin-bottom: 18px;
	}
	.rating-label {
		color: #60716b;
		font-size: 11px;
		font-weight: 600;
	}
	.star-buttons {
		display: flex;
		gap: 4px;
	}
	.star-buttons button {
		padding: 3px;
		background: transparent;
	}
	.star-filled {
		color: #d2a74e;
		fill: #d2a74e;
	}
	.star-empty {
		color: #c5c6b8;
	}
	.color-mode-placeholder {
		display: block;
		width: 36px;
		height: 36px;
	}
	@media (max-width: 760px) {
		.hero-paper {
			grid-template-columns: 1fr;
		}
		.hero-copy {
			padding: 43px 8% 30px;
		}
		.hero-copy h1 {
			font-size: clamp(42px, 10vw, 60px);
		}
		.hero-description {
			max-width: 480px;
		}
		.hero-art {
			min-height: 270px;
			margin-top: -6px;
		}
		.sun-disc {
			top: 12px;
			width: 240px;
			height: 240px;
		}
		.orbit {
			top: 22px;
			width: 300px;
			height: 190px;
		}
		.orbit-two {
			top: 42px;
			width: 250px;
			height: 180px;
		}
		.open-book {
			top: 90px;
			width: 210px;
			height: 120px;
		}
		.book-page {
			gap: 8px;
			padding: 18px 16px;
		}
		.book-shadow {
			height: 118px;
		}
		.art-caption {
			right: 11%;
			bottom: 10px;
		}
		.star-one {
			top: 60px;
		}
		.star-two {
			top: 112px;
		}
		.star-three {
			bottom: 45px;
		}
		.hero-bottom-rule {
			bottom: 20px;
		}
		.hero-index {
			bottom: 5px;
		}
		.ticker-row {
			justify-content: flex-start;
		}
		.section-heading {
			align-items: start;
		}
		.main-layout {
			grid-template-columns: 1fr;
		}
		.sidebar {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.most-loved-card {
			grid-row: span 2;
		}
	}
	@media (max-width: 520px) {
		.brand-logo {
			width: 40px;
			height: 40px;
		}
		.brand-word-logo {
			width: 120px;
			height: 34px;
		}
		.hero-shell {
			padding-top: 17px;
		}
		.hero-copy {
			padding: 36px 22px 24px;
		}
		.eyebrow {
			font-size: 8px;
		}
		.hero-description {
			margin-top: 18px;
			font-size: 12px;
		}
		.hero-actions {
			align-items: flex-start;
			gap: 5px 15px;
		}
		.hero-note {
			margin-top: 21px;
		}
		.hero-art {
			min-height: 250px;
		}
		.ticker-row {
			min-height: 43px;
			gap: 17px;
		}
		.ticker-row span {
			font-size: 7px;
		}
		.discover-section {
			padding-top: 48px;
		}
		.section-heading {
			gap: 10px;
		}
		.section-heading h2 {
			max-width: 270px;
			font-size: 34px;
		}
		.section-subtitle {
			max-width: 280px;
			font-size: 10px;
			line-height: 1.6;
		}
		.collection-count {
			min-width: 68px;
			padding-left: 11px;
			font-size: 8px;
		}
		.collection-count span {
			font-size: 20px;
		}
		.discovery-toolbar {
			align-items: flex-start;
			flex-direction: column;
			padding: 11px 0;
		}
		.search-wrap {
			width: 100%;
			max-width: none;
		}
		.search-input {
			font-size: 11px;
		}
		.sort-control {
			align-self: flex-end;
		}
		.filter-row {
			align-items: flex-start;
			flex-direction: column;
			justify-content: center;
			padding: 11px 0;
		}
		.filter-chip {
			padding: 6px 10px;
			font-size: 9px;
		}
		.results-label {
			display: none;
		}
		.story-card {
			padding: 15px 14px 0;
		}
		.story-content {
			gap: 8px;
		}
		.story-title {
			font-size: 19px;
		}
		.story-summary {
			font-size: 10px;
		}
		.story-aside {
			min-width: 44px;
		}
		.story-date {
			font-size: 8px;
		}
		.story-footer {
			min-height: 43px;
		}
		.story-actions {
			gap: 10px;
		}
		.review-link {
			gap: 4px;
			font-size: 8px;
		}
		.sidebar {
			grid-template-columns: 1fr;
		}
		.most-loved-card {
			grid-row: auto;
		}
		.shelf-note {
			min-height: 135px;
		}
		.about-strip .mx-auto {
			align-items: flex-start;
		}
		.about-brand {
			font-size: 14px;
		}
	}
</style>
