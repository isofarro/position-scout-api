# Scout

Scout is a modular application for chess data services.

The first available feature is **Games**, which serves chess games from TWIC issue databases by position (FEN). It queries custom-built TWIC indexes to find and retrieve matching games.

## Requirements

- Node `>= 22.12`
- Yarn 4
- SQLite files for TWIC issues: `twic{issue}g.idx` and `twic{issue}g.graph`

## Install

- `yarn`

## Data Directory Structure

Scout requires a data directory to function. The **Games** feature expects its database files to be located in a `pgn-index` subdirectory within the main data directory.

**Default Structure:**
```
project-root/
  _data/              <-- Default Data Directory
    pgn-index/        <-- Required subdirectory for Games feature
      twic1620g.idx
      twic1620g.graph
      ...
```

## Configuration

You can configure the root data directory and the server port using CLI flags or environment variables.

### Data Directory
- **Default:** `_data/` (relative to project root)
- **CLI Flag:** `--data-dir` or `-d`
- **Env Variable:** `DATA_DIR`

### Port
- **Default:** `3000`
- **CLI Flag:** `--port` or `-p`
- **Env Variable:** `PORT`

## Running the API Server

### Development
```bash
# Default (uses _data/ and port 3000)
yarn dev

# With overrides
yarn dev --data-dir /absolute/path/to/my_data/ --port 3001
```

### Production (PM2)
To run the server in production using PM2, create an `ecosystem.config.js` file in the root directory:

```javascript
module.exports = {
  apps: [{
    name: "scout",
    script: "./dist/server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      DATA_DIR: "/absolute/path/to/_data/"
    }
  }]
};
```

Build and start the application:
```bash
# Build the project
yarn build

# Start with PM2
pm2 start ecosystem.config.js
```

## CLI Usage

Scout includes a CLI tool for interacting with the services directly.

### Usage

```bash
yarn scout <command> [options]
```

### Commands

#### `games <issue> <fen>`
Find games in a specific TWIC issue that match a given FEN position.

- `issue`: The TWIC issue number (e.g., `1626`).
- `fen`: The FEN string to search for.

### Output Handling
By default, Yarn 4 minimizes output noise. You can usually pipe the output directly to other tools.

**Example: Pure JSON Output**
```bash
yarn scout games 1626 "r1bqk2r/2pp1ppp/p1n2n2/1pb1p3/4P3/1B3N2/PPPP1PPP/RNBQ1RK1 w kq - 2 7" | jq
```

## API Endpoints

### `GET /twic/:issue/:fen`
- `issue` is the TWIC number, e.g. `1620`
- `fen` must be URL-encoded
- **Response:**
  ```json
  {
    "issue": 1620,
    "fen": "...",
    "count": 5,
    "games": [
      {
        "id": 1,
        "header": { "white": "Player A", "black": "Player B", ... },
        "moves": ["fen1|move1", "fen2|move2", "fen_terminal"]
      }
    ]
  }
  ```

## Notes

- Databases are opened in read-only mode.
- If the requested issue files cannot be found, the API/CLI responds with an error showing the checked paths.
