import { Message } from 'discord.js';
import type { Client } from 'discord.js';

import { sortMessagesById } from './message.js';
import { setupBot } from '../client-mock.js';
import { mockMessage } from '../message-mock.js';
let client: Client;

beforeEach(async () => {
  client = await setupBot();
});

describe('sortMessagesById', () => {
  it('should sort an array of messages by ID in descending order', async () => {
    const message1 = mockMessage({ client });
    const message2 = mockMessage({ client });
    const message3 = mockMessage({ client });
    await message1.edit('Message 1');
    message1.id = '1';
    await message2.edit('Message 2');
    message2.id = '2';
    await message3.edit('Message 3');
    message3.id = '3';

    const messages: Message[] = [message2, message1, message3];

    const result = sortMessagesById(messages);

    expect(result[0].content).toBe('Message 1');
    expect(result[1].content).toBe('Message 2');
    expect(result[2].content).toBe('Message 3');
  });
});
