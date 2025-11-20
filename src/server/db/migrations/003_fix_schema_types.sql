-- Migration to fix schema type mismatches for chat and todo tables
-- This addresses the issue where events and users tables use UUID but chat/todo tables expect BIGINT

-- Drop existing tables if they exist to recreate with correct types
DROP TABLE IF EXISTS event_chat_messages;
DROP TABLE IF EXISTS event_todo_items;

-- Create chat messages table with UUID references
CREATE TABLE IF NOT EXISTS event_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_event_id ON event_chat_messages (event_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON event_chat_messages (created_at);

-- Create todo items table with UUID references
CREATE TABLE IF NOT EXISTS event_todo_items (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todo_items_event_id ON event_todo_items (event_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_completed ON event_todo_items (is_completed);
CREATE INDEX IF NOT EXISTS idx_todo_items_priority ON event_todo_items (priority);

-- Add updated_at trigger for todo items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_todo_items_updated_at
    BEFORE UPDATE ON event_todo_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();