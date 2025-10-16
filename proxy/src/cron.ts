import { getPostgresClient, Client } from './db.js';
import { Syncable } from 'syncables';

async function createCollections(
  collectionName: string,
  client: Client,
): Promise<void> {
  const openApiSpecFilename = `openapi/generated/${collectionName}.yaml`;
  const envKey = `${collectionName.toUpperCase().replace('-', '_')}_AUTH_HEADERS`;
  if (!process.env[envKey]) {
    console.warn(`Skipping ${collectionName} because ${envKey} is not set`);
    return;
  }
  console.log(`Creating collection for ${collectionName} using ${openApiSpecFilename}`);
  const authHeaders: { [key: string]: string } = JSON.parse(process.env[envKey]);
  const syncable = new Syncable(
    collectionName,
    openApiSpecFilename,
    authHeaders,
    client,
  );
  await syncable.init();
  await syncable.run();
}

async function run(): Promise<void> {
  const client = await getPostgresClient();
  // get list of backend platforms from env vars
  const platformsList = Object.keys(process.env)
    .filter((x) => x.endsWith('_AUTH_HEADERS'))
    .map((x) =>
      x
        .substring(0, x.length - '_AUTH_HEADERS'.length)
        .toLowerCase()
        .replace('_', '-'),
    );
  console.log('Platforms to sync:', platformsList);
  await Promise.all(
    platformsList.map((platform) => createCollections(platform, client)),
  );
  await client.end();
}

// ...
run();