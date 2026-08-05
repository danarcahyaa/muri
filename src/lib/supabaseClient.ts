import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'placeholder'

// Safety check for boilerplate/draft status: logs a warning if keys are missing
// but does not halt execution, allowing the site to load initial pages.
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
) {
  if (typeof window !== 'undefined') {
    console.warn(
      'Supabase credentials are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.'
    )
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey)

