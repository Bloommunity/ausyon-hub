<script setup lang="ts">
const emit = defineEmits<{
  share: []
}>()
</script>

<template>
  <section class="hero-shell mx-auto max-w-[1320px] px-5 pt-8 sm:px-8 sm:pt-12">
    <div class="hero-paper paper-grain">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-star">✳</span> A community-made reading nook</div>
        <h1 class="serif">Every universe<br>has <span class="hero-underline">another story.</span></h1>
        <p class="hero-description">
          A little corner of the internet to find, share, and leave some love for alternate universe stories from all over.
        </p>
        <div class="hero-actions">
          <a href="#discover" class="hero-cta">
            Find your next AU
            <UIcon name="i-lucide-arrow-down-right" class="size-4" />
          </a>
          <button class="hero-secondary" @click="emit('share')">
            <UIcon name="i-lucide-feather" class="size-[17px]" /> Leave one on the shelf
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
        <div class="art-caption">a story is a door<br>to somewhere else</div>
      </div>
      <div class="hero-bottom-rule" />
      <div class="hero-index">VOL. 01 <span>·</span> THE INFINITE SHELF</div>
    </div>
    <div class="ticker-row">
      <span>FANDOM IS A LOVE LANGUAGE</span><i>✳</i>
      <span>EVERY AU HAS A HOME HERE</span><i>✳</i>
      <span>READ SOMETHING A LITTLE DIFFERENT</span>
    </div>
  </section>
</template>
