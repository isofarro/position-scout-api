export type GameMove = string;

export type GameHeader = {
  gameNo: number;
  white: string;
  black: string;
  event: string;
  site: string;
  opening: string;
  whiteElo?: number;
  blackElo?: number;
  eventDate?: string;
  round?: string;
  result?: string;
  timeControl?: string;
  date?: string;
  ECO?: string;
  plyCount?: number;
};

export type Game = {
  id: number;
  header: GameHeader;
  moves: GameMove[];
};

export type QueryResponse = {
  issue: number;
  fen: string;
  count: number;
  games: Game[];
};
