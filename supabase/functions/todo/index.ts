import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { supabaseAdmin, getUserFromRequest } from '../../../src/lib/supabaseClient.ts';

console.log('Todo Edge Function initializing...');

serve(async (req: Request) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));
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
  console.log('User context resolved. User ID:', userId);

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
      if (listError) {
        console.error('Supabase error fetching todos (listError):', JSON.stringify(listError, null, 2));
        throw listError;
      }
      data = todos;
      console.log('Todos fetched:', data);
    } else if (req.method === 'POST') {
      console.log(`POST /api/todo (create) for user ${userId}`);
      const body = await req.json();
      const { task } = body;
      if (!task) {
        error = 'Task is required';
        status = 400;
      } else {
        const { data: newTodo, error: createError } = await supabaseAdmin
          .from('Todo')
          .insert([{ task, user_id: userId }])
          .select()
          .single();
        if (createError) {
          console.error('Supabase error creating todo (createError):', JSON.stringify(createError, null, 2));
          throw createError;
        }
        data = newTodo;
        status = 201;
        console.log('Todo created:', data);
      }
    } else if (req.method === 'PUT') {
      console.log(`PUT /api/todo (toggle) for user ${userId}`);
      const body = await req.json();
      const { id, is_complete } = body;
      if (id === undefined || typeof is_complete !== 'boolean') {
        error = 'Todo ID and is_complete (boolean) are required';
        status = 400;
      } else {
        const { data: updatedTodo, error: toggleError } = await supabaseAdmin
          .from('Todo')
          .update({ is_complete })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
        if (toggleError) {
          console.error('Supabase error toggling todo (toggleError):', JSON.stringify(toggleError, null, 2));
          throw toggleError;
        }
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
        if (deleteError) {
          console.error('Supabase error deleting todo (deleteError):', JSON.stringify(deleteError, null, 2));
          throw deleteError;
        }
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
    console.log(`Responding with status: ${status}, body:`, JSON.stringify(responseBody));
    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    });

  } catch (err: any) {
    console.error('Detailed Error in Edge Function:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    const errorResponse = { error: err.message || 'Internal Server Error' };
    console.log(`Responding with error status: 500, body:`, JSON.stringify(errorResponse));
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
