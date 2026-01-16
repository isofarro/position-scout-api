import fs from 'node:fs';
import path from 'node:path';
import { DatabaseManager } from '../common/db/DatabaseManager';
import { normalizeFen } from '../common/util/fen';
import { GameRepository } from './GameRepository';
import { QueryResponse } from './types';

export class GameService {
  constructor(private dataDir: string) {}

  /**
   * Finds games matching the given FEN in the specified TWIC issue.
   */
  async findGames(issue: number, fenRaw: string): Promise<QueryResponse> {
    const fen = normalizeFen(fenRaw);
    const { idxPath, graphPath } = this.getIssueDbPaths(issue);

    if (!fs.existsSync(idxPath) || !fs.existsSync(graphPath)) {
      throw new Error(`Issue database not found: ${issue} (Checked: ${graphPath})`);
    }

    const db = DatabaseManager.open(graphPath, [{ alias: 'idx', path: idxPath }]);

    try {
      const repo = new GameRepository(db);
      const gameIds = repo.findGamesByFen(fen);

      const games = gameIds.map((id) => {
        const header = repo.getGameHeader(id);
        const moves = repo.getGameMoves(id);

        if (!header) {
          throw new Error(`Game header not found for ID: ${id}`);
        }

        return { id, header, moves };
      });

      return {
        issue,
        fen,
        count: games.length,
        games,
      };
    } finally {
      db.close();
    }
  }

  private getIssueDbPaths(issue: number) {
    // The games service expects data in a 'pgn-index' subdirectory
    const gamesDataDir = path.join(this.dataDir, 'pgn-index');
    const base = `twic${issue}g`;
    const idxPath = path.join(gamesDataDir, `${base}.idx`);
    const graphPath = path.join(gamesDataDir, `${base}.graph`);
    return { idxPath, graphPath };
  }
}
