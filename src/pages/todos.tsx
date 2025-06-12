import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseBrowserClient';
import { useAuth } from '../contexts/AuthContext'; // To get user and logout function
// import { User } from '@supabase/supabase-js'; // User type is available via useAuth

interface Todo {
  id: number;
  user_id: string;
  task: string;
  is_complete: boolean;
  inserted_at: string;
}

const TodosPage: React.FC = () => {
  const { user, logout } = useAuth(); // Get user and logout function
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Corrected fetch function to get JWT from session
  const fetchTodos = async () => {
    if (!user) {
      setLoading(false);
      setTodos([]); // Clear todos if no user
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'User session not found. Please log in again.');
      }
      const token = sessionData.session.access_token;

      const response = await fetch('/api/todo', { // Using the Vite proxy
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch todos: ${response.status}`);
      }
      
      const data = await response.json();
      setTodos(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTodos();
  }, [user]); // Re-fetch if user changes


  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'User session not found. Please log in again.');
      }
      const token = sessionData.session.access_token;

      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ task: newTask }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add todo: ${response.status}`);
      }
      
      const addedTodo = await response.json();
      setTodos([...todos, addedTodo]);
      setNewTask('');
      fetchTodos(); // Re-fetch to ensure list is up-to-date, especially with IDs from DB
    } catch (err: any) {
      setError(err.message);
      console.error("Error adding todo:", err);
    }
  };

  const handleToggleComplete = async (id: number) => {
    setError(null);
    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            throw new Error(sessionError?.message || 'User session not found.');
        }
        const token = sessionData.session.access_token;

        const response = await fetch(`/api/todo`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id }), // Edge function expects ID in body for PUT
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to toggle todo: ${response.status}`);
        }
        const updatedTodo = await response.json();
        setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err: any) {
        setError(err.message);
        console.error("Error toggling todo:", err);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setError(null);
    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            throw new Error(sessionError?.message || 'User session not found.');
        }
        const token = sessionData.session.access_token;

        const response = await fetch(`/api/todo`, { // Assuming DELETE also takes ID in body as per Edge func structure
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to delete todo: ${response.status}`);
        }
        setTodos(todos.filter(todo => todo.id !== id));
    } catch (err: any) {
        setError(err.message);
        console.error("Error deleting todo:", err);
    }
  };


  if (loading && !user && todos.length === 0) { // More precise initial load check
    return <div className="container mx-auto p-4 text-center">Loading authentication state...</div>;
  }
  
  if (!user) {
    return <div className="container mx-auto p-4 text-center">Please log in to view your todos. (This message indicates an issue with routing or auth state)</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Todos</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4 text-sm">{error}</p>}

      <form onSubmit={handleAddTask} className="mb-6 flex">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new todo"
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading} // Disable input while loading operations
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md focus:outline-none focus:shadow-outline"
          disabled={loading} // Disable button while loading operations
        >
          {loading && todos.length > 0 ? 'Processing...' : 'Add'}
        </button>
      </form>

      {loading && todos.length === 0 && <p className="text-center">Loading todos...</p>}
      
      {!loading && todos.length === 0 && !error && (
        <p className="text-center text-gray-500">You have no todos yet. Add one above!</p>
      )}

      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`p-4 rounded-md shadow flex items-center justify-between transition-colors duration-150 ${ 
              todo.is_complete ? 'bg-green-100 text-gray-500' : 'bg-white'
            }`}
          >
            <span 
              onClick={() => !loading && handleToggleComplete(todo.id)} // Prevent action if another op is loading
              className={`cursor-pointer flex-grow ${todo.is_complete ? 'line-through' : ''}`}
            >
              {todo.task}
            </span>
            <button
              onClick={() => !loading && handleDeleteTodo(todo.id)} // Prevent action if another op is loading
              className="ml-4 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-2 rounded focus:outline-none disabled:opacity-50"
              disabled={loading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodosPage;
