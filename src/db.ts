import Database from 'better-sqlite3';
import path from 'node:path';

export function getIssueDbPaths(dataDir: string, issue: number) {
  const base = `twic${issue}g`;
  const idxPath = path.join(dataDir, `${base}.idx`);
  const graphPath = path.join(dataDir, `${base}.graph`);
  return { idxPath, graphPath };
}

export function openDb(dbPath: string) {
  return new Database(dbPath, { readonly: true, fileMustExist: true });
}

export function openIssueDb(idxPath: string, graphPath: string) {
  const db = openDb(graphPath);
  db.pragma('query_only = ON');
  const safePath = idxPath.replace(/'/g, "''");
  db.exec(`ATTACH DATABASE '${safePath}' AS idx`);
  return db;
}
