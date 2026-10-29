import type { SupabaseClient, User } from '@supabase/supabase-js'
import { computed, useRuntimeConfig, useState } from '#imports'

export function useHubAuth() {
  const config = useRuntimeConfig()
  const supabase = useState<SupabaseClient | null>('supabase-client', () => null)
  const user = useState<User | null>('supabase-user', () => null)

  const isConfigured = computed(() => Boolean(config.public.supabaseUrl && config.public.supabaseAnonKey))

  async function signInWithX() {
    if (!isConfigured.value || !supabase.value) {
      throw new Error('X sign-in is not configured yet. Add your Supabase URL and anon key to the environment.')
    }

    const { error } = await supabase.value.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  }

  async function signOut() {
    if (!supabase.value) return
    const { error } = await supabase.value.auth.signOut()
    if (error) throw error
  }

  return { supabase, user, isConfigured, signInWithX, signOut }
}
