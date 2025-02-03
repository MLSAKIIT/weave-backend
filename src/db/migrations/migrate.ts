import db from '../index';
import { up } from './20231010_create_users_table';

async function migrate() {
  try {
    await db.execute(up);
    console.log('Migration successful');
  } catch (e) {
    console.error('Migration failed', e);
  }
}

migrate();