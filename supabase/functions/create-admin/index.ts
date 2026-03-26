import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { email, password } = await req.json();

  // Delete existing user first
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existing?.users?.find((u) => u.email === email);
  if (existingUser) {
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }

  // Create fresh user with correct password
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, userId: data.user?.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
