import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin, getUserFromRequest } from '../../../src/lib/supabaseClient.ts';

console.log('Todo Edge Function initializing...');

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Adjust in production!
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const userContext = await getUserFromRequest(req);
  if (!userContext) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }
  const userId = userContext.id;

  try {
    let data: any = null;
    let error: string | null = null;
    let status = 200;

    if (req.method === 'GET') {
      console.log(`GET /api/todo (list) for user ${userId}`);
      const { data: todos, error: listError } = await supabaseAdmin
        .from('Todo')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (listError) throw listError;
      data = todos;
      console.log('Todos fetched:', data);
    } else if (req.method === 'POST') {
      console.log(`POST /api/todo (create) for user ${userId}`);
      const body = await req.json();
      const { title } = body;
      if (!title) {
        error = 'Title is required';
        status = 400;
      } else {
        const { data: newTodo, error: createError } = await supabaseAdmin
          .from('Todo')
          .insert([{ title, user_id: userId }])
          .select()
          .single();
        if (createError) throw createError;
        data = newTodo;
        status = 201;
        console.log('Todo created:', data);
      }
    } else if (req.method === 'PUT') {
      console.log(`PUT /api/todo (toggle) for user ${userId}`);
      const body = await req.json();
      const { id, is_done } = body;
      if (!id || typeof is_done !== 'boolean') {
        error = 'Todo ID and is_done (boolean) are required';
        status = 400;
      } else {
        const { data: updatedTodo, error: toggleError } = await supabaseAdmin
          .from('Todo')
          .update({ is_done })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
        if (toggleError) throw toggleError;
        if (!updatedTodo) {
            error = 'Todo not found or not authorized';
            status = 404;
        } else {
            data = updatedTodo;
            console.log('Todo toggled:', data);
        }
      }
    } else if (req.method === 'DELETE') {
      console.log(`DELETE /api/todo (delete) for user ${userId}`);
      const body = await req.json();
      const { id } = body;
      if (!id) {
        error = 'Todo ID is required';
        status = 400;
      } else {
        const { error: deleteError, count } = await supabaseAdmin
          .from('Todo')
          .delete({ count: 'exact' })
          .eq('id', id)
          .eq('user_id', userId);
        if (deleteError) throw deleteError;
        if (count === 0) {
            error = 'Todo not found or not authorized to delete';
            status = 404;
        } else {
            data = { message: 'Todo deleted successfully' };
            console.log('Todo deleted, ID:', id);
        }
      }
    } else {
      error = 'Method not allowed';
      status = 405;
    }

    const responseBody = error ? { error } : (data !== null ? data : {});
    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    });

  } catch (err: any) {
    console.error('Error in Edge Function:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
