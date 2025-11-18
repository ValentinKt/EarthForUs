import { errorLogger } from '../src/server/utils/errorLogger';

async function main() {
  await errorLogger.chatFailedToLoadMessages(1, { reason: 'relation_missing_or_fk_mismatch' });
  await errorLogger.chatDisconnected({ clientId: 'sample-client', totalClients: 0 });
  await errorLogger.checklistFailedToLoad(1, { reason: 'relation_missing_or_fk_mismatch' });
  await errorLogger.authLoginError('john.doe@test.fr', { reason: 'password_mismatch' });
  await errorLogger.serverError('/api/health', { reason: 'sample_unhandled_error' });
  await errorLogger.log('Event Error', 'Failed to load event detail', { eventId: 1, reason: 'not_implemented_or_schema_mismatch' });
}

main().then(() => process.exit(0)).catch(err => {
  console.error('append_sample_errors failed', err);
  process.exit(1);
});