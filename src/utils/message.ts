import { Snowflake } from '@sapphire/snowflake';
import type { Message } from 'discord.js';

export function sortMessagesById<T extends Message>(messages: T[]): T[] {
	return messages.sort((a, b) => Snowflake.compare(a.id, b.id));
}
