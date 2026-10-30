import type { Story } from '~/types/story'

export function createSampleStories(): Story[] {
  return [
    {
      id: '1',
      title: 'The Stars Between Us',
      fandom: 'Stranger Things',
      author: 'mossandmoon',
      platform: 'AO3',
      url: 'https://archiveofourown.org/',
      summary: 'A small-town radio station, a midnight frequency, and the boy who keeps calling from the other side of the static.',
      tags: ['Coffee shop AU', 'Slow burn', 'Found family'],
      reviewCount: 128,
      rating: 4.9,
      createdAt: '2026-03-28'
    },
    {
      id: '2',
      title: 'A Study in Starlight',
      fandom: 'Genshin Impact',
      author: 'papercranes',
      platform: 'Wattpad',
      url: 'https://www.wattpad.com/',
      summary: 'Two rival astronomers share the same observatory. The sky has other plans for them.',
      tags: ['Academic rivals', 'Fluff', 'Mutual pining'],
      reviewCount: 96,
      rating: 4.8,
      createdAt: '2026-03-24'
    },
    {
      id: '3',
      title: 'Letters from the Last Train',
      fandom: 'Jujutsu Kaisen',
      author: 'softstatic',
      platform: 'AO3',
      url: 'https://archiveofourown.org/',
      summary: 'Every evening, the same train. Every evening, a note left on the seat beside him.',
      tags: ['Soulmates', 'Angst with a happy ending', 'Letters'],
      reviewCount: 74,
      rating: 4.7,
      createdAt: '2026-03-20'
    },
    {
      id: '4',
      title: 'The Florist on Baker Street',
      fandom: 'Sherlock',
      author: 'inkandivy',
      platform: 'X',
      url: 'https://x.com/',
      summary: 'The consulting detective next door claims not to like flowers. The florist knows better.',
      tags: ['Neighbors AU', 'Fluff', 'Domestic'],
      reviewCount: 62,
      rating: 4.9,
      createdAt: '2026-03-18'
    },
    {
      id: '5',
      title: 'Everything in Its Right Place',
      fandom: 'Our Flag Means Death',
      author: 'seaglass',
      platform: 'Other',
      url: 'https://example.com/',
      summary: 'A seaside bookshop, a retired sailor, and one very persistent regular.',
      tags: ['Bookshop AU', 'Cozy', 'Second chances'],
      reviewCount: 41,
      rating: 4.6,
      createdAt: '2026-03-15'
    },
    {
      id: '6',
      title: 'When the Rain Remembers',
      fandom: 'BTS',
      author: 'lilacseason',
      platform: 'AO3',
      url: 'https://archiveofourown.org/',
      summary: 'A shared umbrella becomes a ritual. Neither of them knows who will let go first.',
      tags: ['Idol AU', 'Slow burn', 'Comfort'],
      reviewCount: 35,
      rating: 4.8,
      createdAt: '2026-03-12'
    }
  ]
}
