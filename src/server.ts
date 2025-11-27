import Fastify from 'fastify';
import { getConfig } from './config';
import { getIssueDbPaths } from './db';
import { findGamesByFen, getGameMoves } from './graph';
import { getGameHeader } from './idx';
import { normalizeFen } from './fen';
import fs from 'node:fs';

const app = Fastify({ logger: true });

app.get('/twic/:issue/:fen', async (req, reply) => {
  const issueStr = (req.params as any).issue as string;
  const fenEnc = (req.params as any).fen as string;
  const issue = Number(issueStr);
  if (!Number.isInteger(issue)) {
    return reply.status(400).send({ error: 'invalid issue' });
  }
  let fen: string;
  try {
    fen = normalizeFen(decodeURIComponent(fenEnc));
  } catch (e: any) {
    return reply.status(400).send({ error: 'invalid fen', detail: String(e?.message || e) });
  }
  const { dataDir } = getConfig();
  const { idxPath, graphPath } = getIssueDbPaths(dataDir, issue);
  if (!fs.existsSync(idxPath) || !fs.existsSync(graphPath)) {
    return reply.status(404).send({ error: 'issue not found', issue, idxPath, graphPath });
  }
  const gameIds = findGamesByFen(graphPath, fen);
  const results = gameIds.map((id) => {
    const header = getGameHeader(idxPath, id);
    const moves = getGameMoves(graphPath, id);
    return { id, header, moves };
  });
  return reply.send({ issue, fen, count: results.length, games: results });
});

const { port } = getConfig();
app.listen({ port, host: '0.0.0.0' });
