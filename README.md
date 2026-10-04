# Colabspace - IIT Dharwad

Project collaboration platform.

## Supabase Setup

### 1. Create Supabase Project
1. Go to https://app.supabase.com
2. Create new project
3. Note project URL and anon/service role keys

### 2. Run Migrations
```bash
# Using Supabase CLI
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

Or run manually in SQL Editor:
```sql
-- Copy contents of supabase/migrations/001_initial_schema.sql
```

### 3. Configure Auth Hooks
Create Edge Function for role claims:

**supabase/functions/_shared/cors.ts**
```ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**supabase/functions/auth-hook/index.ts**
```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user } = await req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  
  const claims = {
    'role': data?.role || 'student'
  }
  
  return new Response(JSON.stringify({ claims }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Configure in Supabase Dashboard:
- Authentication > Hooks > Add Hook
- URL: https://<project>.supabase.co/functions/v1/auth-hook
- Event: `user.created` and `user.updated`

### 4. Required Supabase Settings
- Enable Email OTP only
- Disable email confirmations for testing
- Set site URL to `http://localhost:3000`
- Add redirect URLs
- Enable RLS on all tables (done in migration)

### 5. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Storage
Bucket `project-covers` is created with public read policies.

## Development
```bash
npm install
npm run dev
```
