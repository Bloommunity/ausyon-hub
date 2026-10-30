<script setup lang="ts">
const emit = defineEmits<{
  share: []
}>()
</script>

<template>
  <section class="hero-shell mx-auto max-w-[1320px] px-5 pt-8 sm:px-8 sm:pt-12">
    <div class="hero-paper paper-grain">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-star">✳</span> Where imagined worlds feel real</div>
        <h1 class="serif">Step into the worlds<br>you've <span class="hero-underline">imagined.</span></h1>
        <p class="hero-description">
          A home for alternate universes—where beloved characters take new paths and every what-if opens a world of its own.
        </p>
        <div class="hero-actions">
          <a href="#discover" class="hero-cta">
            Explore the worlds
            <UIcon name="i-lucide-arrow-down-right" class="size-4" />
          </a>
          <button class="hero-secondary" @click="emit('share')">
            <UIcon name="i-lucide-feather" class="size-[17px]" /> Share your what-if
          </button>
        </div>
        <div class="hero-note"><span class="note-dash">—</span> built by readers, for readers</div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="sun-disc" />
        <div class="orbit orbit-one" />
        <div class="orbit orbit-two" />
        <div class="art-star star-one">✦</div>
        <div class="art-star star-two">✳</div>
        <div class="art-star star-three">✧</div>
        <div class="open-book">
          <div class="book-page book-page-left"><span /><span /><span /><span /></div>
          <div class="book-page book-page-right"><span /><span /><span /><span /></div>
          <div class="book-shadow" />
        </div>
        <div class="art-caption">a what-if becomes<br>a world of its own</div>
      </div>
      <div class="hero-bottom-rule" />
      <div class="hero-index">VOL. 01 <span>·</span> THE INFINITE SHELF</div>
    </div>
    <div class="ticker-row">
      <span>IMAGINATION HAS NO CANON</span><i>✳</i>
      <span>EVERY WHAT-IF OPENS A WORLD</span><i>✳</i>
      <span>STEP INTO A DIFFERENT STORY</span>
    </div>
  </section>
</template>
