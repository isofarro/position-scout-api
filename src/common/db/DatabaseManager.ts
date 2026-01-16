import Database from 'better-sqlite3';

export type DB = Database.Database;

export type DatabaseAttachment = {
  path: string;
  alias: string;
};

export class DatabaseManager {
  /**
   * Opens a SQLite database in read-only mode with query_only pragma enabled.
   * Optionally attaches secondary databases.
   */
  static open(mainPath: string, attachments: DatabaseAttachment[] = []): DB {
    const db = new Database(mainPath, { readonly: true, fileMustExist: true });
    
    // Enforce read-only queries
    db.pragma('query_only = ON');

    // Attach secondary databases
    for (const { path, alias } of attachments) {
      // Escape single quotes in path for the SQL string
      const safePath = path.replace(/'/g, "''");
      db.exec(`ATTACH DATABASE '${safePath}' AS ${alias}`);
    }

    return db;
  }
}
