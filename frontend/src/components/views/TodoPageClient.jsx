'use client';

import { useTodosContext } from '../../context/TodosContext';
import { TodoView } from '../TodoView';

export function TodoPageClient() {
  const { todos, loading, addTodo, updateTodo, toggleTodo, deleteTodo } = useTodosContext();

  return (
    <TodoView
      todos={todos}
      loading={loading}
      onAdd={addTodo}
      onToggle={toggleTodo}
      onEdit={updateTodo}
      onDelete={deleteTodo}
    />
  );
}
