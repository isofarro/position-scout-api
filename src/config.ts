import path from 'node:path';

export type AppConfig = {
  dataDir: string;
  port: number;
};

export function getConfig(): AppConfig {
  const args = process.argv.slice(2);
  let dataDirArg: string | null = null;
  let portArg: string | null = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (/^(--)?data-?dir=/.test(a) || /^data-?dir=/.test(a) || /^dataDir=/.test(a)) {
      dataDirArg = a.split('=')[1] || null;
      continue;
    }
    if (a === '--data-dir' || a === '--dataDir' || a === '-d') {
      dataDirArg = args[i + 1] || null;
      i++;
      continue;
    }
    if (/^(--)?port=/.test(a) || /^port=/.test(a)) {
      portArg = a.split('=')[1] || null;
      continue;
    }
    if (a === '--port' || a === '-p') {
      portArg = args[i + 1] || null;
      i++;
      continue;
    }
  }
  const dataDirEnv = process.env.TWIC_DATA_DIR;
  const dataDir = dataDirArg || dataDirEnv || path.resolve(process.cwd(), '_data/twic/');
  const port = portArg ? Number(portArg) : Number(process.env.PORT || 3000);
  return { dataDir, port };
}
