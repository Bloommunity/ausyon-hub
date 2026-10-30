<script setup lang="ts">
const props = defineProps<{
  platformFilters: Array<{ label: string; value: string }>
  auTypes: string[]
  resultCount: number
}>()

const search = defineModel<string>('search', { required: true })
const sortMode = defineModel<string>('sortMode', { required: true })
const platform = defineModel<string>('platform', { required: true })
const auType = defineModel<string>('auType', { required: true })
const searchInput = ref<HTMLInputElement | null>(null)

defineShortcuts({
  meta_k: () => searchInput.value?.focus()
})
</script>

<template>
  <div class="discovery-toolbar">
    <div class="search-wrap">
      <UIcon name="i-lucide-search" class="search-icon size-[18px]" />
      <input
        ref="searchInput"
        v-model="search"
        type="search"
        aria-label="Search stories"
        placeholder="Search a fandom, trope, or feeling..."
        class="search-input"
      >
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
    <div class="filter-groups">
      <div class="filter-group">
        <label class="filter-group-label" for="platform-filter">Platform</label>
        <div class="filter-select-wrap">
          <select id="platform-filter" v-model="platform" class="filter-select">
            <option v-for="filter in props.platformFilters" :key="filter.value" :value="filter.value">
              {{ filter.label }}
            </option>
          </select>
          <UIcon name="i-lucide-chevron-down" class="filter-select-icon size-3.5" aria-hidden="true" />
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-group-label" for="au-type-filter">AU type</label>
        <div class="filter-select-wrap">
          <select id="au-type-filter" v-model="auType" class="filter-select">
            <option value="Everything">All types</option>
            <option v-for="type in props.auTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <UIcon name="i-lucide-chevron-down" class="filter-select-icon size-3.5" aria-hidden="true" />
        </div>
      </div>
    </div>
    <span class="results-label">{{ resultCount }} stories found</span>
  </div>
</template>
