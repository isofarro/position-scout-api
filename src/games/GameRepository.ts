import { Statement } from 'better-sqlite3';
import { DB } from '../common/db/DatabaseManager';
import { GameHeader, GameMove } from './types';

const STATEMENT_DEFINITIONS = {
  findFenId: 'SELECT id FROM fens WHERE fen = ?',
  findGames: `SELECT gm.gameId AS gameId 
       FROM gameMoves gm 
       JOIN moves m ON gm.moveId = m.id 
       JOIN idx.games g ON gm.gameId = g.id 
       WHERE m.fromFenId = ? OR m.toFenId = ? 
       GROUP BY gm.gameId 
       ORDER BY g.date ASC`,
  getGame: `SELECT id, gameNo, eventId, siteId, openingId, whiteId, whiteElo, blackId, blackElo, 
                round, result, timeControl, date, eco, plyCount 
         FROM idx.games WHERE id = ?`,
  getPlayer: 'SELECT name FROM idx.players WHERE id = ?',
  getEvent: 'SELECT date, name FROM idx.events WHERE id = ?',
  getSite: 'SELECT name FROM idx.sites WHERE id = ?',
  getOpening: 'SELECT name FROM idx.openings WHERE id = ?',
  getMoves: `SELECT gm.ply AS ply, m.move AS move, f_from.fen AS fromFen, f_to.fen AS toFen 
         FROM gameMoves gm 
         JOIN moves m ON gm.moveId = m.id 
         JOIN fens f_from ON m.fromFenId = f_from.id 
         JOIN fens f_to ON m.toFenId = f_to.id 
         WHERE gm.gameId = ? 
         ORDER BY gm.ply`,
} as const;

export class GameRepository {
  private statements = new Map<keyof typeof STATEMENT_DEFINITIONS, Statement>();

  constructor(private db: DB) {
    this.prepareStatements();
  }

  private prepareStatements() {
    for (const [key, sql] of Object.entries(STATEMENT_DEFINITIONS)) {
      this.statements.set(key as keyof typeof STATEMENT_DEFINITIONS, this.db.prepare(sql));
    }
  }

  findGamesByFen(fen: string): number[] {
    const fenRow = this.statements.get('findFenId')!.get(fen) as { id: number } | undefined;

    if (!fenRow) return [];

    const rows = this.statements.get('findGames')!.all(fenRow.id, fenRow.id) as {
      gameId: number;
    }[];
    return rows.map((r) => r.gameId);
  }

  getGameHeader(gameId: number): GameHeader | undefined {
    // Note: We assume 'idx' database is attached
    const game = this.statements.get('getGame')!.get(gameId) as any;

    if (!game) {
      return undefined;
    }

    const whiteRow = this.statements.get('getPlayer')!.get(game.whiteId) as any;
    const blackRow = this.statements.get('getPlayer')!.get(game.blackId) as any;
    const eventRow = this.statements.get('getEvent')!.get(game.eventId) as any;
    const siteRow = this.statements.get('getSite')!.get(game.siteId) as any;
    const openingRow = this.statements.get('getOpening')!.get(game.openingId) as any;

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
    };
  }

  getGameMoves(gameId: number): GameMove[] {
    const rows = this.statements.get('getMoves')!.all(gameId) as {
      ply: number;
      move: string;
      fromFen: string;
      toFen: string;
    }[];

    const out: GameMove[] = rows.map((r) => `${r.fromFen}|${r.move}`);
    if (rows.length > 0) out.push(rows[rows.length - 1].toFen);
    return out;
  }
}
