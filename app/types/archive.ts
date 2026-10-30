export interface ArchiveSnapshot {
  url: string
  timestamp: string
}

export interface ArchiveLookupResponse {
  snapshot: ArchiveSnapshot | null
}
