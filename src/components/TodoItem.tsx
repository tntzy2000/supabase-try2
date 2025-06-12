import React from 'react';

interface TodoItemProps {
  // Define props for TodoItem, e.g., todo object, toggle function, delete function
  id: string;
  title: string;
  is_done: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ id, title, is_done, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center justify-between p-2 border-b ${is_done ? 'line-through text-gray-400' : ''}`}>
      <span onClick={() => onToggle(id)} className="cursor-pointer">
        {title}
      </span>
      <button onClick={() => onDelete(id)} className="text-red-500 hover:text-red-700">
        Delete
      </button>
    </div>
  );
};

export default TodoItem;
