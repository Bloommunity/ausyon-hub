import { normalizeAo3WorkUrl } from '~/utils/ao3-archive'
import type { ArchiveLookupResponse } from '~/types/archive'

interface WaybackAvailabilityResponse {
  archived_snapshots?: {
    closest?: {
      available?: boolean
      status?: string
      url?: string
      timestamp?: string
    }
  }
}

export default defineEventHandler(async (event): Promise<ArchiveLookupResponse> => {
  const input = getQuery(event).url
  if (typeof input !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Enter an AO3 work URL.' })
  }

  const workUrl = normalizeAo3WorkUrl(input)
  if (!workUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter a valid AO3 work or chapter URL.'
    })
  }

  let availability: WaybackAvailabilityResponse
  try {
    availability = await $fetch<WaybackAvailabilityResponse>(
      'https://archive.org/wayback/available',
      { query: { url: workUrl }, timeout: 10_000 }
    )
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'The Internet Archive could not be reached. Please try again.',
      cause: error
    })
  }

  const snapshot = availability.archived_snapshots?.closest
  if (!snapshot?.available || snapshot.status !== '200' || !snapshot.url || !snapshot.timestamp) {
    return { snapshot: null }
  }

  const snapshotUrl = new URL(snapshot.url)
  if (snapshotUrl.hostname !== 'web.archive.org' || !snapshotUrl.pathname.startsWith('/web/')) {
    throw createError({
      statusCode: 502,
      statusMessage: 'The Internet Archive returned an invalid snapshot link.'
    })
  }
  snapshotUrl.protocol = 'https:'

  return {
    snapshot: {
      url: snapshotUrl.href,
      timestamp: snapshot.timestamp
    }
  }
})
