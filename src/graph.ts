import type { DB } from './db';
import { GameMove } from './types';

export function findGamesByFen(db: DB, fen: string) {
  const fenRow = db.prepare('SELECT id FROM fens WHERE fen = ?').get(fen) as
    | { id: number }
    | undefined;
  if (!fenRow) return [] as number[];
  const stmt = db.prepare(
    'SELECT DISTINCT gm.gameId AS gameId FROM gameMoves gm JOIN moves m ON gm.moveId = m.id WHERE m.fromFenId = ? OR m.toFenId = ?',
  );
  const rows = stmt.all(fenRow.id, fenRow.id) as { gameId: number }[];
  return rows.map((r) => r.gameId);
}

export function getGameMoves(db: DB, gameId: number) {
  const rows = db
    .prepare(
      'SELECT gm.ply AS ply, m.move AS move, f_from.fen AS fromFen, f_to.fen AS toFen FROM gameMoves gm JOIN moves m ON gm.moveId = m.id JOIN fens f_from ON m.fromFenId = f_from.id JOIN fens f_to ON m.toFenId = f_to.id WHERE gm.gameId = ? ORDER BY gm.ply',
    )
    .all(gameId) as { ply: number; move: string; fromFen: string; toFen: string }[];
  const out: GameMove[] = rows.map((r) => `${r.fromFen}|${r.move}`);
  if (rows.length > 0) out.push(rows[rows.length - 1].toFen);
  return out;
}

export function getFenOccurrences(db: DB, gameId: number, fen: string) {
  const fenRow = db.prepare('SELECT id FROM fens WHERE fen = ?').get(fen) as
    | { id: number }
    | undefined;
  if (!fenRow) {
    return [] as number[];
  }
  const rows = db
    .prepare(
      'SELECT gm.ply AS ply FROM gameMoves gm JOIN moves m ON gm.moveId = m.id WHERE gm.gameId = ? AND (m.fromFenId = ? OR m.toFenId = ?) ORDER BY gm.ply',
    )
    .all(gameId, fenRow.id, fenRow.id) as { ply: number }[];
  return rows.map((r) => r.ply);
}
