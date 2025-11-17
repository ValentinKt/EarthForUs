import type { PoolClient } from 'pg';

export const getTodoItemsByEvent = {
  name: 'get-todo-items-by-event',
  text: `SELECT 
           t.id, 
           t.title, 
           t.description, 
           t.priority,
           t.due_date,
           t.is_completed,
           t.created_at,
           t.updated_at,
           creator.id as created_by_id,
           creator.first_name as created_by_first_name,
           creator.last_name as created_by_last_name,
           completer.id as completed_by_id,
           completer.first_name as completed_by_first_name,
           completer.last_name as completed_by_last_name,
           t.completed_at
         FROM event_todo_items t
         JOIN users creator ON t.created_by = creator.id
         LEFT JOIN users completer ON t.completed_by = completer.id
         WHERE t.event_id = $1
         ORDER BY 
           CASE t.priority 
             WHEN 'high' THEN 1 
             WHEN 'medium' THEN 2 
             WHEN 'low' THEN 3 
           END,
           t.due_date ASC NULLS LAST,
           t.created_at ASC`,
};

export const createTodoItem = {
  name: 'create-todo-item',
  text: `INSERT INTO event_todo_items (event_id, created_by, title, description, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, priority, due_date, is_completed, created_at, updated_at`,
};

export const updateTodoItem = {
  name: 'update-todo-item',
  text: `UPDATE event_todo_items 
         SET title = $2, description = $3, priority = $4, due_date = $5, updated_at = NOW()
         WHERE id = $1 AND event_id = $6
         RETURNING id, title, description, priority, due_date, is_completed, updated_at`,
};

export const toggleTodoItemComplete = {
  name: 'toggle-todo-item-complete',
  text: `UPDATE event_todo_items 
         SET is_completed = $2, completed_by = $3, completed_at = CASE WHEN $2 = true THEN NOW() ELSE NULL END
         WHERE id = $1 AND event_id = $4
         RETURNING id, is_completed, completed_at, completed_by`,
};

export const deleteTodoItem = {
  name: 'delete-todo-item',
  text: `DELETE FROM event_todo_items 
         WHERE id = $1 AND event_id = $2 AND created_by = $3
         RETURNING id`,
};

export async function createTodoItemTx(
  client: PoolClient, 
  args: [number, number, string, string | null, string, Date | null]
) {
  const res = await client.query(createTodoItem, args);
  return res.rows[0];
}