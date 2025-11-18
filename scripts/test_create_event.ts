import { withTransaction } from '../src/server/db/pool';
import { createEventTx } from '../src/server/db/queries/events';

async function main() {
  const args: [string, string | null, string | null, Date, Date, number, string] = [
    'Test Cleanup Event',
    'Testing category default via script',
    'City Park',
    new Date('2025-12-01T10:00:00Z'),
    new Date('2025-12-01T12:00:00Z'),
    50,
    '26b18edc-43ef-4554-8058-97e3013ae3fe',
  ];
  const result = await withTransaction((client) => createEventTx(client, args));
  console.log('Inserted event:', { id: result.id, category: (result as any).category ?? 'N/A' });
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
