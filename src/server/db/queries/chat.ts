import type { PoolClient } from 'pg';

export const getChatMessagesByEvent = {
  name: 'get-chat-messages-by-event',
  text: `SELECT 
           m.id, 
           m.message, 
           m.created_at,
           u.id as user_id,
           u.first_name,
           u.last_name,
           u.email
         FROM event_chat_messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.event_id = $1
         ORDER BY m.created_at ASC
         LIMIT $2 OFFSET $3`,
};

export const createChatMessage = {
  name: 'create-chat-message',
  text: `INSERT INTO event_chat_messages (event_id, user_id, message)
         VALUES ($1, $2, $3)
         RETURNING id, message, created_at`,
};

export const deleteChatMessage = {
  name: 'delete-chat-message',
  text: `DELETE FROM event_chat_messages 
         WHERE id = $1 AND user_id = $2 
         RETURNING id`,
};

export async function createChatMessageTx(
  client: PoolClient, 
  args: [number, number, string]
) {
  const res = await client.query(createChatMessage, args);
  return res.rows[0];
}