import { getPostgresClient, Client } from './db.js';
import { Syncable } from 'syncables';

async function createCollections(
  collectionName: string,
  client: Client,
): Promise<void> {
  const openApiSpecFilename = `openapi/generated/${collectionName}.yaml`;
  const authHeaders: { [key: string]: string } = {
    [process.env[
      `${collectionName.toUpperCase().replace('-', '_')}_AUTH_HEADER_NAME`
    ]!]: process.env[`${collectionName.toUpperCase()}_AUTH_HEADER_VALUE`]!,
  };
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
    .filter((x) => x.endsWith('_AUTH_HEADER_NAME'))
    .map((x) =>
      x
        .substring(0, x.length - '_AUTH_HEADER_NAME'.length)
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

// ...
// runOAuthClient({
//   authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
//   tokenURL: 'https://oauth2.googleapis.com/token',
//   clientID: process.env.GOOGLE_CLIENT_ID || ((): void => { throw new Error('GOOGLE_CLIENT_ID not set') })(),
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET || ((): void => { throw new Error('GOOGLE_CLIENT_SECRET not set') })(),
//   callbackURL: 'http://localhost:8000/callback'
// }, 8000, async (token) => {
//   console.log(`Received OAuth token: ${token}`);
// }); // Start the OAuth client on port 8000
// console.log('Data fetched and inserted. Visit http://localhost:8000/ if you need to renew the GOOGLE_OAUTH_TOKEN env var.');
