import { FastifyInstance } from 'fastify';
import { GameService } from './GameService';
import { getConfig } from '../common/config';
import { InvalidFenException } from '../common/util/fen';

export async function gameRoutes(fastify: FastifyInstance) {
  const { dataDir } = getConfig();
  const service = new GameService(dataDir);

  fastify.get('/twic/:issue/:fen', async (req, reply) => {
    const issueStr = (req.params as any).issue as string;
    const fenEnc = (req.params as any).fen as string;

    const issue = Number(issueStr);
    if (!Number.isInteger(issue)) {
      return reply.status(400).send({ error: 'invalid issue' });
    }

    try {
      const result = await service.findGames(issue, decodeURIComponent(fenEnc));
      return reply.send(result);
    } catch (e: any) {
      if (e instanceof InvalidFenException) {
        return reply.status(400).send({ error: 'invalid fen', detail: e.message });
      }
      if (e.message && e.message.includes('Issue database not found')) {
        return reply.status(404).send({ error: 'issue not found', detail: e.message });
      }

      fastify.log.error(e);
      return reply.status(500).send({ error: 'internal server error' });
    }
  });
}
