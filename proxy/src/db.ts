/* eslint @typescript-eslint/no-explicit-any: 0 */
import { Client } from 'pg';
export { Client } from 'pg';

export async function getPostgresClient(): Promise<Client> {
  const client = new Client({
    user: process.env.POSTGRES_APP_USER || 'syncables',
    password: process.env.POSTGRES_APP_PASSWORD || 'syncables',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_APP_DB || 'syncables',
  });
  await client.connect();
  return client;
}

export function getFields(
  openApiSpec: any,
  endPoint: string,
  rowsFrom: string | undefined,
): { [key: string]: { type: string } } | undefined {
  const successResponseProperties =
    openApiSpec.paths[endPoint]?.get?.responses?.['200']?.content;
  // console.log(openApiSpec.paths, endPoint);
  const schema =
    successResponseProperties?.['application/ld+json']?.schema ||
    successResponseProperties?.['application/json']?.schema;
  // console.log(`Schema for ${endPoint}:`, JSON.stringify(schema, null, 2));
  // const whatWeWant = schema?.properties?.[rowsFrom].items?.properties;
  const whatWeWant =
    typeof rowsFrom === 'string'
      ? schema?.properties?.[rowsFrom]?.items?.properties
      : schema?.items?.properties;
  // console.log(`What we want (getFields ${endPoint} ${rowsFrom}):`, JSON.stringify(whatWeWant, null, 2));
  return whatWeWant;
}
export async function createSqlTable(
  client: Client,
  tableName: string,
  whatWeWant: { [key: string]: { type: string } },
): Promise<void> {
  const rowSpecs: string[] = [];
  // console.log(`What we want (createSqlTable ${tableName}):`, JSON.stringify(whatWeWant, null, 2));
  Object.entries(whatWeWant).forEach(([key, value]) => {
    const type = (value as { type: string }).type;
    if (type === 'string') {
      rowSpecs.push(`"S${key}" TEXT`);
    } else if (type === 'integer') {
      rowSpecs.push(`"S${key}" INTEGER`);
      // } else if (type === 'boolean') {
      //   rowSpecs.push(`"S${key}" BOOLEAN`);
    }
  });
  const createTableQuery = `
CREATE TABLE IF NOT EXISTS ${tableName.replace('-', '_')} (
  ${rowSpecs.join(',\n  ')}\n
);
`;
  console.log(createTableQuery);
  await client.query(createTableQuery);
}
export async function insertData(
  client: Client,
  tableName: string,
  items: any[],
  fields: string[],
): Promise<void> {
  console.log(`Fetched data:`, items);
  await Promise.all(
    items.map((item: any) => {
      const insertQuery = `INSERT INTO ${tableName.replace('-', '_')} (${fields.map((x) => `"S${x}"`).join(', ')}) VALUES (${fields.map((field) => `'${item[field]}'`).join(', ')})`;
      // console.log(`Executing insert query: ${insertQuery}`);
      return client.query(insertQuery);
    }),
  );
}
