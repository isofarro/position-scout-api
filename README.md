# Position Scout API

The Position Scout API serves chess games from TWIC issue databases by position (FEN). It queries custom-built TWIC indexes to find and retrieve matching games.

## Requirements

- Node `>= 22.12`
- Yarn 1 (Corepack will auto-pin)
- SQLite files for TWIC issues: `twic{issue}g.idx` and `twic{issue}g.graph`

## Install

- `yarn`

## Configure Data Directory

- Default directory: `_data/twic/` (relative to project root)
- Override options:
  - CLI flag: `--data-dir` or `-d`
  - Environment variable: `TWIC_DATA_DIR`

Examples:

- Set default structure:
  - Create `_data/twic/` and place files like `twic1620g.idx` and `twic1620g.graph` inside
- Override with CLI (absolute or relative):
  - `yarn dev --data-dir /absolute/path/to/_data/twic/`
  - `yarn dev --data-dir ../../../Projects-chess/go-pgnutils/_data/twic/`
- Override via env:
  - `TWIC_DATA_DIR=/absolute/path/to/_data/twic/ yarn dev`

## Start the Server

- Default:
  - `yarn dev`
  - Port defaults to `3000`
- With data-dir override:
  - `yarn dev --data-dir /my/path/to/twic/`
- Change port:
  - `yarn dev --port 3001`
  - or `PORT=3001 yarn dev`

## API

- `GET /twic/:issue/:fen`
  - `issue` is the TWIC number, e.g. `1620`
  - `fen` must be URL-encoded
- Response shape:
  - `{ issue, fen, count, games: [{ id, header, moves }] }`
  - `header` fields (PGN-style): `gameNo`, `white`, `whiteElo`, `black`, `blackElo`, `event`, `eventDate`, `site`, `opening`, `round`, `result`, `timeControl`, `date`, `ECO`, `plyCount`
  - `moves` is an array of strings:
    - Each element except the last: `<from_fen>|<move>`
    - Last element: terminal position FEN

### Types

- The TypeScript types for the response payload are defined in `src/types.ts`:
  - `QueryResponse`, `Game`, `GameHeader`, `GameMove`

## FEN Normalization

- The server normalizes incoming FEN by removing the half-move clock and move number and sanitizing en-passant squares when no legal en-passant capture is available.
- Example input: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
- Normalized: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -`

## Examples

- Query the initial position in TWIC 1620:
  - `curl "http://127.0.0.1:3000/twic/1620/rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR%20w%20KQkq%20-%200%201"`
- Query a middle-game position (example, URL-encoded):
  - `curl "http://127.0.0.1:3000/twic/1620/rn1qkbnr%2Fpp2pppp%2F2p5%2F3pPb2%2F3P2P1%2F8%2FPPP2P1P%2FRNBQKBNR%20b%20KQkq%20g3%200%204"`

## Notes

- Databases are opened in read-only mode.
- If the requested issue files cannot be found in the configured directory, the API responds with an error showing the resolved paths.
