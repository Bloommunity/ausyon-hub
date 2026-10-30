export interface Story {
  id: string
  title: string
  fandom: string
  author: string
  platform: string
  url: string
  summary: string
  tags: string[]
  reviewCount: number
  rating: number
  createdAt: string
}

export interface StoryReview {
  id: string
  storyId: string
  userId: string
  author: string
  rating: number
  comment: string
  createdAt: string
}

export interface StorySubmissionForm {
  title: string
  fandom: string
  platform: string
  url: string
  summary: string
  auType: string
  tags: string
}
