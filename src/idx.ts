import { openDb } from "./db";

export function getGameHeader(idxPath: string, gameId: number) {
  const db = openDb(idxPath);
  const game = db
    .prepare(
      "SELECT id, gameNo, eventId, siteId, openingId, whiteId, whiteElo, blackId, blackElo, round, result, timeControl, date, eco, plyCount FROM games WHERE id = ?"
    )
    .get(gameId) as any;
  if (!game) {
    db.close();
    return undefined;
  }
  const playerStmt = db.prepare("SELECT name FROM players WHERE id = ?");
  const eventStmt = db.prepare("SELECT date, name FROM events WHERE id = ?");
  const siteStmt = db.prepare("SELECT name FROM sites WHERE id = ?");
  const openingStmt = db.prepare("SELECT name FROM openings WHERE id = ?");
  const whiteRow = playerStmt.get(game.whiteId) as any;
  const blackRow = playerStmt.get(game.blackId) as any;
  const eventRow = eventStmt.get(game.eventId) as any;
  const siteRow = siteStmt.get(game.siteId) as any;
  const openingRow = openingStmt.get(game.openingId) as any;
  db.close();
  return {
    gameNo: game.gameNo ?? null,
    white: whiteRow?.name ?? null,
    whiteElo: game.whiteElo ?? null,
    black: blackRow?.name ?? null,
    blackElo: game.blackElo ?? null,
    event: eventRow?.name ?? null,
    eventDate: eventRow?.date ?? null,
    site: siteRow?.name ?? null,
    opening: openingRow?.name ?? null,
    round: game.round ?? null,
    result: game.result ?? null,
    timeControl: game.timeControl ?? null,
    date: game.date ?? null,
    ECO: game.eco ?? null,
    plyCount: game.plyCount ?? null,
  } as const;
}
