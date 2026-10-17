import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance: WrappedDatabase | null = null;
let sqlJsDb: SqlJsDatabase | null = null;
let dbFilePath: string = '';
let saveTimer: ReturnType<typeof setInterval> | null = null;

export function getDatabasePath(): string {
  const envPath = process.env.DATABASE_PATH || process.env.DB_PATH || './data/urja_sync.db';
  return path.resolve(process.cwd(), envPath);
}

/**
 * Statement wrapper — mimics better-sqlite3's Statement API:
 *   stmt.run(...params)  → { changes, lastInsertRowid }
 *   stmt.get(...params)  → row | undefined
 *   stmt.all(...params)  → row[]
 */
class WrappedStatement {
  constructor(private db: SqlJsDatabase, private sql: string) {}

  run(...params: any[]): { changes: number; lastInsertRowid: number } {
    const flat = flattenParams(params);
    this.db.run(this.sql, flat);
    const changesRow = this.db.exec('SELECT changes() AS c, last_insert_rowid() AS r');
    const changes = changesRow.length > 0 ? (changesRow[0].values[0][0] as number) : 0;
    const lastInsertRowid = changesRow.length > 0 ? (changesRow[0].values[0][1] as number) : 0;
    scheduleSave();
    return { changes, lastInsertRowid };
  }

  get(...params: any[]): any {
    const flat = flattenParams(params);
    const stmt = this.db.prepare(this.sql);
    stmt.bind(flat);
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      stmt.free();
      const row: any = {};
      cols.forEach((c: string, i: number) => { row[c] = vals[i]; });
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...params: any[]): any[] {
    const flat = flattenParams(params);
    const results: any[] = [];
    const stmt = this.db.prepare(this.sql);
    stmt.bind(flat);
    while (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      const row: any = {};
      cols.forEach((c: string, i: number) => { row[c] = vals[i]; });
      results.push(row);
    }
    stmt.free();
    return results;
  }
}

function flattenParams(params: any[]): any[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

/**
 * Wrapped database — mimics the better-sqlite3 Database API.
 */
export class WrappedDatabase {
  constructor(private db: SqlJsDatabase) {}

  prepare(sql: string): WrappedStatement {
    return new WrappedStatement(this.db, sql);
  }

  exec(sql: string): void {
    this.db.run(sql);
    scheduleSave();
  }

  pragma(pragmaStr: string): any {
    // sql.js doesn't support all pragmas but we can try
    try {
      const result = this.db.exec(`PRAGMA ${pragmaStr}`);
      return result.length > 0 ? result[0].values[0][0] : undefined;
    } catch {
      // Ignore unsupported pragmas (WAL, busy_timeout not applicable in sql.js)
      return undefined;
    }
  }

  close(): void {
    saveToDisk();
    this.db.close();
  }

  transaction<T>(fn: () => T): () => T {
    return () => {
      this.db.run('BEGIN TRANSACTION');
      try {
        const result = fn();
        this.db.run('COMMIT');
        scheduleSave();
        return result;
      } catch (err) {
        this.db.run('ROLLBACK');
        throw err;
      }
    };
  }
}

function saveToDisk(): void {
  if (sqlJsDb && dbFilePath) {
    try {
      const data = sqlJsDb.export();
      const buffer = Buffer.from(data);
      const dir = path.dirname(dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbFilePath, buffer);
    } catch (err) {
      console.error('Failed to save database to disk:', err);
    }
  }
}

let saveScheduled = false;
function scheduleSave(): void {
  if (!saveScheduled) {
    saveScheduled = true;
    setTimeout(() => {
      saveToDisk();
      saveScheduled = false;
    }, 1000); // Batch saves every 1 second
  }
}

export async function initializeDb(overridePath?: string): Promise<WrappedDatabase> {
  const SQL = await initSqlJs();

  dbFilePath = overridePath || getDatabasePath();
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
  }

  // Enable foreign keys
  sqlJsDb.run('PRAGMA foreign_keys = ON');

  const wrapped = new WrappedDatabase(sqlJsDb);

  dbInstance = wrapped;

  // Periodic save every 5 seconds
  if (saveTimer) clearInterval(saveTimer);
  saveTimer = setInterval(saveToDisk, 5000);

  return wrapped;
}

export function getDb(_overridePath?: string): WrappedDatabase {
  if (dbInstance) {
    return dbInstance;
  }
  throw new Error('Database not initialized. Call initializeDb() first.');
}

export function closeDb(): void {
  if (saveTimer) {
    clearInterval(saveTimer);
    saveTimer = null;
  }
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    sqlJsDb = null;
  }
}

// Handle process exit
process.on('exit', () => { saveToDisk(); });
process.on('SIGINT', () => { saveToDisk(); process.exit(0); });
process.on('SIGTERM', () => { saveToDisk(); process.exit(0); });
