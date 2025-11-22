import { Router } from 'express';
import type { Request, Response } from 'express';
import { pool } from '../../db/pool';
import { 
  getTodoItemsByEvent, 
  createTodoItem, 
  updateTodoItem, 
  toggleTodoItemComplete,
  deleteTodoItem 
} from '../../db/queries/todos';
import { mapPgError } from '../../db/errors';
import { logger } from '../../../shared/utils/logger';
import { errorLogger } from '../../utils/errorLogger';

const router = Router();
const log = logger.withContext('api/todos');

// Get todo items for an event
router.get('/events/:eventId/todos', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    
    // Validate event ID - reject '0' and empty values
    if (!eventId || eventId === '0') {
      log.warn('invalid_event_id', { eventId: req.params.eventId });
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    log.info('get_todo_items', { eventId });
    const result = await pool.query(getTodoItemsByEvent, [eventId]);
    
    const todos = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority,
      dueDate: row.due_date,
      isCompleted: row.is_completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: {
        id: row.created_by_id,
        firstName: row.created_by_first_name,
        lastName: row.created_by_last_name
      },
      completedBy: row.completed_by_id ? {
        id: row.completed_by_id,
        firstName: row.completed_by_first_name,
        lastName: row.completed_by_last_name
      } : null,
      completedAt: row.completed_at
    }));

    log.debug('todo_items_retrieved', { count: todos.length });
    return res.json({ todos, count: todos.length });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('get_todo_items_error', mapped);
    // Persist checklist load failures
    await errorLogger.checklistFailedToLoad(Number(req.params.eventId), mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Create a todo item
router.post('/events/:eventId/todos', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const { title, description, priority, dueDate } = req.body || {};
    const userId = (req as any).user?.id; // This would come from auth middleware
    
    if (!eventId || eventId === '0') {
      log.warn('invalid_event_id', { eventId: req.params.eventId });
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!userId) {
      log.warn('unauthorized_todo_attempt');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      log.warn('invalid_title', { title });
      return res.status(400).json({ error: 'Title is required and cannot be empty' });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 200) {
      log.warn('title_too_long', { length: trimmedTitle.length });
      return res.status(400).json({ error: 'Title is too long (max 200 characters)' });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const todoPriority = priority && validPriorities.includes(priority) ? priority : 'medium';
    
    const trimmedDescription = description ? description.trim() : null;
    if (trimmedDescription && trimmedDescription.length > 1000) {
      log.warn('description_too_long', { length: trimmedDescription.length });
      return res.status(400).json({ error: 'Description is too long (max 1000 characters)' });
    }

    let dueDateObj = null;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      if (Number.isNaN(dueDateObj.getTime())) {
        log.warn('invalid_due_date', { dueDate });
        return res.status(400).json({ error: 'Invalid due date' });
      }
    }

    log.info('create_todo_item', { eventId, userId, title: trimmedTitle, priority: todoPriority });
    const result = await pool.query(createTodoItem, [
      eventId, 
      userId, 
      trimmedTitle, 
      trimmedDescription, 
      todoPriority, 
      dueDateObj
    ]);
    
    const newTodo = result.rows[0];
    log.info('todo_item_created', { todoId: newTodo.id });
    
    return res.status(201).json({ 
      todo: {
        id: newTodo.id,
        title: newTodo.title,
        description: newTodo.description,
        priority: newTodo.priority,
        dueDate: newTodo.due_date,
        isCompleted: newTodo.is_completed,
        createdAt: newTodo.created_at,
        updatedAt: newTodo.updated_at
      }
    });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('create_todo_item_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Update a todo item
router.put('/events/:eventId/todos/:todoId', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const todoId = Number(req.params.todoId);
    const { title, description, priority, dueDate } = req.body || {};
    
    if (!eventId || eventId === '0') {
      log.warn('invalid_event_id', { eventId: req.params.eventId });
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!Number.isFinite(todoId) || todoId <= 0) {
      log.warn('invalid_todo_id', { todoId: req.params.todoId });
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      log.warn('invalid_title', { title });
      return res.status(400).json({ error: 'Title is required and cannot be empty' });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 200) {
      log.warn('title_too_long', { length: trimmedTitle.length });
      return res.status(400).json({ error: 'Title is too long (max 200 characters)' });
    }

    const validPriorities = ['low', 'medium', 'high'];
    const todoPriority = priority && validPriorities.includes(priority) ? priority : 'medium';
    
    const trimmedDescription = description ? description.trim() : null;
    if (trimmedDescription && trimmedDescription.length > 1000) {
      log.warn('description_too_long', { length: trimmedDescription.length });
      return res.status(400).json({ error: 'Description is too long (max 1000 characters)' });
    }

    let dueDateObj = null;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      if (Number.isNaN(dueDateObj.getTime())) {
        log.warn('invalid_due_date', { dueDate });
        return res.status(400).json({ error: 'Invalid due date' });
      }
    }

    log.info('update_todo_item', { eventId, todoId, title: trimmedTitle, priority: todoPriority });
    const result = await pool.query(updateTodoItem, [
      todoId,
      trimmedTitle, 
      trimmedDescription, 
      todoPriority, 
      dueDateObj,
      eventId
    ]);
    
    if (result.rows.length === 0) {
      log.warn('todo_item_not_found', { eventId, todoId });
      return res.status(404).json({ error: 'Todo item not found' });
    }
    
    const updatedTodo = result.rows[0];
    log.info('todo_item_updated', { todoId: updatedTodo.id });
    
    return res.json({ 
      todo: {
        id: updatedTodo.id,
        title: updatedTodo.title,
        description: updatedTodo.description,
        priority: updatedTodo.priority,
        dueDate: updatedTodo.due_date,
        isCompleted: updatedTodo.is_completed,
        updatedAt: updatedTodo.updated_at
      }
    });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('update_todo_item_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Toggle todo item completion status
router.patch('/events/:eventId/todos/:todoId/complete', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const todoId = Number(req.params.todoId);
    const { isCompleted } = req.body || {};
    const userId = (req as any).user?.id; // This would come from auth middleware
    
    if (!eventId || eventId === '0') {
      log.warn('invalid_event_id', { eventId: req.params.eventId });
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!Number.isFinite(todoId) || todoId <= 0) {
      log.warn('invalid_todo_id', { todoId: req.params.todoId });
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    if (typeof isCompleted !== 'boolean') {
      log.warn('invalid_completion_status', { isCompleted });
      return res.status(400).json({ error: 'isCompleted must be a boolean' });
    }

    if (!userId) {
      log.warn('unauthorized_completion_attempt');
      return res.status(401).json({ error: 'Authentication required' });
    }

    log.info('toggle_todo_completion', { eventId, todoId, isCompleted, userId });
    const result = await pool.query(toggleTodoItemComplete, [
      todoId,
      isCompleted,
      userId,
      eventId
    ]);
    
    if (result.rows.length === 0) {
      log.warn('todo_item_not_found', { eventId, todoId });
      return res.status(404).json({ error: 'Todo item not found' });
    }
    
    const updatedTodo = result.rows[0];
    log.info('todo_completion_toggled', { todoId: updatedTodo.id, isCompleted });
    
    return res.json({ 
      todo: {
        id: updatedTodo.id,
        isCompleted: updatedTodo.is_completed,
        completedAt: updatedTodo.completed_at,
        completedBy: updatedTodo.completed_by
      }
    });
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('toggle_todo_completion_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

// Delete a todo item
router.delete('/events/:eventId/todos/:todoId', async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const todoId = Number(req.params.todoId);
    const userId = (req as any).user?.id; // This would come from auth middleware
    
    if (!eventId || eventId === '0') {
      log.warn('invalid_event_id', { eventId: req.params.eventId });
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!Number.isFinite(todoId) || todoId <= 0) {
      log.warn('invalid_todo_id', { todoId: req.params.todoId });
      return res.status(400).json({ error: 'Invalid todo ID' });
    }

    if (!userId) {
      log.warn('unauthorized_deletion_attempt');
      return res.status(401).json({ error: 'Authentication required' });
    }

    log.info('delete_todo_item', { eventId, todoId, userId });
    const result = await pool.query(deleteTodoItem, [todoId, eventId, userId]);
    
    if (result.rows.length === 0) {
      log.warn('todo_item_not_found_or_not_owner', { eventId, todoId, userId });
      return res.status(404).json({ error: 'Todo item not found or you are not the creator' });
    }
    
    log.info('todo_item_deleted', { todoId });
    return res.status(204).send();
  } catch (err) {
    const mapped = mapPgError(err);
    log.error('delete_todo_item_error', mapped);
    return res.status(500).json({ error: mapped.message, code: mapped.code });
  }
});

export default router;