import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import { defineNuxtPlugin, useRuntimeConfig, useState } from '#imports'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) return

  const client = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  )
  const user = useState<User | null>('supabase-user', () => null)
  const { data: { session } } = await client.auth.getSession()
  user.value = session?.user ?? null
  client.auth.onAuthStateChange((_event, nextSession) => {
    user.value = nextSession?.user ?? null
  })

  useState('supabase-client', () => client)
})
