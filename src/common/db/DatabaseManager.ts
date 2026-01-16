import Database from 'better-sqlite3';

export type DB = Database.Database;

export type DatabaseAttachment = {
  path: string;
  alias: string;
};

export class DatabaseManager {
  /**
   * Opens a SQLite database.
   * Attempts to open in read-write mode first to ensure journal_mode is DELETE (avoiding -wal/-shm files),
   * then locks it down with query_only = ON.
   * Falls back to read-only mode if write access is denied.
   */
  static open(mainPath: string, attachments: DatabaseAttachment[] = []): DB {
    try {
      return this.openReadWriteAndFix(mainPath, attachments);
    } catch (e) {
      // If any error occurs during RW attempt (permissions, mixed RO/RW files), fallback to strict RO
      return this.openStrictReadOnly(mainPath, attachments);
    }
  }

  private static openReadWriteAndFix(mainPath: string, attachments: DatabaseAttachment[]): DB {
    const db = new Database(mainPath, { readonly: false, fileMustExist: true });
    try {
      // Ensure WAL is disabled to prevent -shm/-wal files
      db.pragma('journal_mode = DELETE');

      for (const { path, alias } of attachments) {
        const safePath = path.replace(/'/g, "''");
        db.exec(`ATTACH DATABASE '${safePath}' AS ${alias}`);
        // Ensure WAL is disabled for attachments too
        db.pragma(`${alias}.journal_mode = DELETE`);
      }

      // Enforce read-only queries
      db.pragma('query_only = ON');
      return db;
    } catch (e) {
      db.close();
      throw e;
    }
  }

  private static openStrictReadOnly(mainPath: string, attachments: DatabaseAttachment[]): DB {
    const db = new Database(mainPath, { readonly: true, fileMustExist: true });
    db.pragma('query_only = ON');

    for (const { path, alias } of attachments) {
      const safePath = path.replace(/'/g, "''");
      db.exec(`ATTACH DATABASE '${safePath}' AS ${alias}`);
    }

    return db;
  }
}
