<script setup lang="ts">
defineProps<{
  isSignedIn: boolean
  userLabel: string
}>()

const emit = defineEmits<{
  share: []
}>()

const mobileMenuOpen = ref(false)

function requestShare() {
  mobileMenuOpen.value = false
  emit('share')
}
</script>

<template>
  <header class="site-header">
    <div class="site-header-inner mx-auto h-[82px] max-w-[1320px] px-5 sm:px-8">
      <nav class="site-nav hidden items-center md:flex" aria-label="Main navigation">
        <a class="nav-link nav-link-active" href="#discover">Discover</a>
        <a class="nav-link" href="#most-loved">Most loved</a>
        <a class="nav-link" href="#about">Our little corner</a>
      </nav>
      <a href="/" class="brand-lockup" aria-label="AUsyon Hub home">
        <img src="/images/brand/ausyon-hub-logo-horizontal.png" alt="AUsyon Hub" class="brand-word-logo">
      </a>
      <div class="site-header-actions hidden items-center md:flex">
        <ClientOnly>
          <UColorModeButton aria-label="Toggle dark mode" />
        </ClientOnly>
        <UButton
          v-if="isSignedIn"
          color="neutral"
          variant="ghost"
          icon="i-lucide-user-round"
          :label="userLabel"
        />
        <UButton
          class="submit-button"
          icon="i-lucide-plus"
          label="Share an AU"
          @click="requestShare"
        />
      </div>
      <div class="mobile-header-menu flex items-center md:hidden">
        <button
          class="mobile-menu-button"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <UIcon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
        </button>
      </div>
      <div class="mobile-header-theme flex items-center md:hidden">
        <ClientOnly>
          <UColorModeButton aria-label="Toggle dark mode" />
          <template #fallback><span class="color-mode-placeholder" /></template>
        </ClientOnly>
      </div>
    </div>
    <div v-if="mobileMenuOpen" class="mobile-menu md:hidden">
      <a href="#discover" @click="mobileMenuOpen = false">Discover</a>
      <a href="#most-loved" @click="mobileMenuOpen = false">Most loved</a>
      <a href="#about" @click="mobileMenuOpen = false">Our little corner</a>
      <UButton
        block
        class="submit-button"
        icon="i-lucide-plus"
        label="Share an AU"
        @click="requestShare"
      />
    </div>
  </header>
</template>
