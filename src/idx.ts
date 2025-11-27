import { openDb } from './db';

export function getGameHeader(idxPath: string, gameId: number) {
  const db = openDb(idxPath);
  const game = db
    .prepare(
      'SELECT id, gameNo, eventId, siteId, openingId, whiteId, whiteElo, blackId, blackElo, round, result, timeControl, date, eco, plyCount FROM games WHERE id = ?',
    )
    .get(gameId) as any;
  if (!game) {
    db.close();
    return undefined;
  }
  const playerStmt = db.prepare('SELECT name FROM players WHERE id = ?');
  const eventStmt = db.prepare('SELECT date, name FROM events WHERE id = ?');
  const siteStmt = db.prepare('SELECT name FROM sites WHERE id = ?');
  const openingStmt = db.prepare('SELECT name FROM openings WHERE id = ?');
  const whiteRow = playerStmt.get(game.whiteId) as any;
  const blackRow = playerStmt.get(game.blackId) as any;
  const eventRow = eventStmt.get(game.eventId) as any;
  const siteRow = siteStmt.get(game.siteId) as any;
  const openingRow = openingStmt.get(game.openingId) as any;
  db.close();
  return {
    gameNo: game.gameNo,
    white: whiteRow?.name as string,
    black: blackRow?.name as string,
    event: eventRow?.name as string,
    site: siteRow?.name as string,
    opening: openingRow?.name as string,
    whiteElo: game.whiteElo ?? undefined,
    blackElo: game.blackElo ?? undefined,
    eventDate: eventRow?.date ?? undefined,
    round: game.round ?? undefined,
    result: game.result ?? undefined,
    timeControl: game.timeControl ?? undefined,
    date: game.date ?? undefined,
    ECO: game.eco ?? undefined,
    plyCount: (game.plyCount as number | undefined) ?? undefined,
  } as const;
}
