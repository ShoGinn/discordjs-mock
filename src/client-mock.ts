import { type ClientOptions, Options } from 'discord.js';
import { Client } from 'discord.js';

import { mockClientUser } from './user-mock.js';

// References: https://dev.to/heymarkkop/how-to-implement-test-and-mock-discordjs-v13-slash-commands-with-typescript-22lc
export async function setupBot(override: Partial<ClientOptions> = {}): Promise<Client> {
  const client = mockClient(override);
  await client.login('');
  return client;
}

export function mockClient(
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  override: Partial<ClientOptions> = {
    // Cache everything is used to simulate API responses, removes the limit
    makeCache: Options.cacheEverything(),
  },
): Client {
  const client = new Client({
    intents: [],
    ...override,
  });
  applyClientMocks(client);

  return client;
}

/* Separate this out into its own function to be reused with custom clients */
export function applyClientMocks(client: Client): void {
  Client.prototype.login = async () => await Promise.resolve('');

  mockClientUser(client);
}
