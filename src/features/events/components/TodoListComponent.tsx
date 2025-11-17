import React, { useState, useEffect } from 'react';
import { api } from '../../../shared/utils/api';
import { logger } from '../../../shared/utils/logger';
import { useToast } from '../../../shared/components/Toast';
import Button from '../../../shared/ui/Button';

type TodoItem = {
  id: number;
  event_id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  assigned_to?: number | null;
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
};

type TodoListComponentProps = {
  eventId: number;
  currentUserId?: number;
  currentUserName?: string;
  isOrganizer?: boolean;
};

const TodoListComponent: React.FC<TodoListComponentProps> = ({ 
  eventId, 
  currentUserId, 
  currentUserName,
  isOrganizer = false 
}) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as TodoItem['priority'],
    due_date: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { error: showError, success: showSuccess } = useToast();
  const log = logger.withContext('TodoListComponent');

  useEffect(() => {
    fetchTodos();
  }, [eventId]);

  const fetchTodos = async () => {
    try {
      const data = await api.get<TodoItem[]>(`/api/events/${eventId}/todos`);
      setTodos(data || []);
      log.info('todos_fetched', { count: data?.length || 0, eventId });
    } catch (error) {
      log.error('fetch_todos_error', { error, eventId });
      showError('Failed to load todo items', 'Todo Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const todoData = {
        title: newTodo.title.trim(),
        description: newTodo.description.trim() || null,
        priority: newTodo.priority,
        due_date: newTodo.due_date || null,
        event_id: eventId,
        created_by: currentUserId || 1
      };

      const createdTodo = await api.post<TodoItem>(`/api/events/${eventId}/todos`, todoData);
      
      setTodos(prev => [...prev, createdTodo]);
      showSuccess('Todo item created successfully');
      log.info('todo_created', { eventId, todoId: createdTodo.id });
      
      // Reset form
      setNewTodo({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowAddForm(false);
    } catch (error) {
      log.error('create_todo_error', { error, eventId });
      showError('Failed to create todo item', 'Todo Error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (todoId: number, isCompleted: boolean) => {
    try {
      await api.put(`/api/events/${eventId}/todos/${todoId}`, { 
        is_completed: !isCompleted 
      });
      
      setTodos(prev => prev.map(todo => 
        todo.id === todoId 
          ? { ...todo, is_completed: !isCompleted, updated_at: new Date().toISOString() }
          : todo
      ));
      
      log.info('todo_toggled', { eventId, todoId, completed: !isCompleted });
    } catch (error) {
      log.error('toggle_todo_error', { error, eventId, todoId });
      showError('Failed to update todo item', 'Todo Error');
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    if (!isOrganizer) return;
    
    try {
      await api.del(`/api/events/${eventId}/todos/${todoId}`);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
      showSuccess('Todo item deleted successfully');
      log.info('todo_deleted', { eventId, todoId });
    } catch (error) {
      log.error('delete_todo_error', { error, eventId, todoId });
      showError('Failed to delete todo item', 'Todo Error');
    }
  };

  const getPriorityColor = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const completedTodos = todos.filter(todo => todo.is_completed);
  const incompleteTodos = todos.filter(todo => !todo.is_completed);
  const completionRate = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Event Checklist</h3>
            <p className="text-sm text-gray-600">
              {completedTodos.length} of {todos.length} completed ({completionRate}%)
            </p>
          </div>
          {isOrganizer && (
            <Button
              variant="earth"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : 'Add Task'}
            </Button>
          )}
        </div>
        
        {/* Progress Bar */}
        {todos.length > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCreateTodo} className="space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={newTodo.title}
              onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
            <textarea
              placeholder="Description (optional)..."
              value={newTodo.description}
              onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={2}
            />
            <div className="flex gap-3">
              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as TodoItem['priority'] }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={newTodo.due_date}
                onChange={(e) => setNewTodo(prev => ({ ...prev, due_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Button
                type="submit"
                variant="earth"
                disabled={isCreating}
                className="px-4 py-2"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Todo Items */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>{isOrganizer ? 'No tasks yet. Create your first task!' : 'No tasks assigned yet.'}</p>
          </div>
        ) : (
          <>
            {/* Incomplete Tasks */}
            {incompleteTodos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">To Do ({incompleteTodos.length})</h4>
                {incompleteTodos.map((todo) => (
                  <div key={todo.id} className={`p-3 rounded-lg border ${getPriorityColor(todo.priority)} ${isOverdue(todo.due_date) ? 'border-red-300 bg-red-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleComplete(todo.id, todo.is_completed)}
                        className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{todo.title}</h5>
                            {todo.description && (
                              <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="capitalize">{todo.priority} priority</span>
                              {todo.due_date && (
                                <span className={isOverdue(todo.due_date) ? 'text-red-600 font-medium' : ''}>
                                  Due: {formatDate(todo.due_date)}
                                  {isOverdue(todo.due_date) && ' (Overdue)'}
                                </span>
                              )}
                            </div>
                          </div>
                          {isOrganizer && (
                            <button
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completedTodos.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-gray-700">Completed ({completedTodos.length})</h4>
                {completedTodos.map((todo) => (
                  <div key={todo.id} className="p-3 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleComplete(todo.id, todo.is_completed)}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 line-through">{todo.title}</h5>
                            {todo.description && (
                              <p className="text-sm text-gray-600 mt-1 line-through">{todo.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="capitalize">{todo.priority} priority</span>
                              <span>Completed</span>
                            </div>
                          </div>
                          {isOrganizer && (
                            <button
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TodoListComponent;