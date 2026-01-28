import { Client, Connection } from '@temporalio/client';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!client) {
    const connection = await Connection.connect({
      // For local development
      address: 'localhost:7233',
      
      // For Temporal Cloud (uncomment and configure)
      // address: 'your-namespace.tmprl.cloud:7233',
      // tls: {
      //   clientCertPair: {
      //     crt: await fs.readFile('./certs/client.pem'),
      //     key: await fs.readFile('./certs/client.key'),
      //   },
      // },
    });
    
    client = new Client({
      connection,
      namespace: 'default',
    });
  }
  return client;
}
