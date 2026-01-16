import { Command } from 'commander';
import { getConfig } from './common/config';
import { GameService } from './games/GameService';

const program = new Command();

program
  .name('scout')
  .description('Chess database scout CLI')
  .version('0.1.0');

program
  .command('games')
  .description('Find games matching a FEN string')
  .argument('<issue>', 'TWIC issue number')
  .argument('<fen>', 'FEN string to search for')
  .action(async (issueStr, fen) => {
    const { dataDir } = getConfig();
    const service = new GameService(dataDir);
    const issue = Number(issueStr);

    if (isNaN(issue)) {
      console.error('Error: issue must be a number');
      process.exit(1);
    }

    try {
      const result = await service.findGames(issue, fen);
      console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
      console.error('Error:', e.message);
      process.exit(1);
    }
  });

program.parse();
