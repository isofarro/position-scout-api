import { openDb } from "./db";

export function findGamesByFen(graphPath: string, fen: string) {
  const db = openDb(graphPath);
  const fenRow = db.prepare("SELECT id FROM fens WHERE fen = ?").get(fen) as { id: number } | undefined;
  if (!fenRow) return [] as number[];
  const stmt = db.prepare(
    "SELECT DISTINCT gm.gameId AS gameId FROM gameMoves gm JOIN moves m ON gm.moveId = m.id WHERE m.fromFenId = ? OR m.toFenId = ?"
  );
  const rows = stmt.all(fenRow.id, fenRow.id) as { gameId: number }[];
  db.close();
  return rows.map((r) => r.gameId);
}

export function getGameMoves(graphPath: string, gameId: number) {
  const db = openDb(graphPath);
  const rows = db
    .prepare(
      "SELECT gm.ply AS ply, m.move AS move, f_from.fen AS fromFen, f_to.fen AS toFen FROM gameMoves gm JOIN moves m ON gm.moveId = m.id JOIN fens f_from ON m.fromFenId = f_from.id JOIN fens f_to ON m.toFenId = f_to.id WHERE gm.gameId = ? ORDER BY gm.ply"
    )
    .all(gameId) as { ply: number; move: string; fromFen: string; toFen: string }[];
  const out: string[] = rows.map((r) => `${r.fromFen}|${r.move}`);
  if (rows.length > 0) out.push(rows[rows.length - 1].toFen);
  db.close();
  return out;
}

export function getFenOccurrences(graphPath: string, gameId: number, fen: string) {
  const db = openDb(graphPath);
  const fenRow = db.prepare("SELECT id FROM fens WHERE fen = ?").get(fen) as { id: number } | undefined;
  if (!fenRow) {
    db.close();
    return [] as number[];
  }
  const rows = db
    .prepare(
      "SELECT gm.ply AS ply FROM gameMoves gm JOIN moves m ON gm.moveId = m.id WHERE gm.gameId = ? AND (m.fromFenId = ? OR m.toFenId = ?) ORDER BY gm.ply"
    )
    .all(gameId, fenRow.id, fenRow.id) as { ply: number }[];
  db.close();
  return rows.map((r) => r.ply);
}
