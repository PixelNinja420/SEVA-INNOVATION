import fs from 'fs';
import path from 'path';
import { initializeDb, getDb } from './connection.js';

export async function setupDatabase(dbPath?: string): Promise<void> {
  await initializeDb(dbPath);
  const db = getDb();

  const possibleSchemaPaths = [
    path.join(__dirname, 'schema.sql'),
    path.join(process.cwd(), 'src', 'database', 'schema.sql'),
    path.join(process.cwd(), 'dist', 'database', 'schema.sql')
  ];

  let schemaContent: string | null = null;
  for (const p of possibleSchemaPaths) {
    if (fs.existsSync(p)) {
      schemaContent = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!schemaContent) {
    throw new Error('schema.sql not found in search paths: ' + possibleSchemaPaths.join(', '));
  }

  console.log('Executing schema.sql...');
  // Clean SQL comments before splitting
  const cleanSql = schemaContent
    .split('\n')
    .map(line => {
      const idx = line.indexOf('--');
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join('\n');

  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  for (const stmt of statements) {
    try {
      db.exec(stmt + ';');
    } catch (err: any) {
      if (!err.message?.includes('already exists')) {
        console.warn(`Warning executing statement: ${err.message}\nSQL was: ${stmt.slice(0, 100)}...`);
      }
    }
  }
  console.log('Database schema setup completed successfully.');
}

// Execute directly if run as a script
if (process.argv[1]?.endsWith('setup.ts') || process.argv[1]?.endsWith('setup.js')) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to setup database:', err);
      process.exit(1);
    });
}
