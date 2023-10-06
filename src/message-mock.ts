import {
  ActionRow,
  type ActionRowData,
  type APIActionRowComponent,
  type APIEmbed,
  type APIMessageActionRowComponent,
  Client,
  Collection,
  Embed,
  EmbedBuilder,
  type EmojiIdentifierResolvable,
  GuildEmoji,
  type InteractionReplyOptions,
  type JSONEncodable,
  Message,
  type MessageActionRowComponent,
  type MessageActionRowComponentBuilder,
  type MessageActionRowComponentData,
  type MessageCreateOptions,
  type MessageEditOptions,
  MessagePayload,
  MessageType,
  ReactionEmoji,
  Snowflake,
  type StartThreadOptions,
  type TextBasedChannel,
  User,
} from 'discord.js';
import type { RawMessageData } from 'discord.js/typings/rawDataTypes';

import { mockReaction, mockTextChannel, mockThreadFromParentMessage } from './channel-mock.js';
import { mockGuildMember, mockUser } from './user-mock.js';
import { randomSnowflake } from './utils/snowflake.js';

export function mockEmbed(data: JSONEncodable<APIEmbed> | APIEmbed | EmbedBuilder): Embed {
  return Reflect.construct(Embed, [data instanceof EmbedBuilder ? data.data : data]) as Embed;
}

export function mockActionRow(
  data:
    | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
    | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
    | APIActionRowComponent<APIMessageActionRowComponent>,
): ActionRow<MessageActionRowComponent> {
  return Reflect.construct(ActionRow, [data]) as ActionRow<MessageActionRowComponent>;
}
export type MessageOptions =
  | string
  | MessageEditOptions
  | MessagePayload
  | InteractionReplyOptions
  | MessageCreateOptions;
export function applyMessagePayload(payload: MessageOptions, message: Message): Message<boolean> {
  if (typeof payload === 'string') {
    message.content = payload;
  }
  if (payload instanceof MessagePayload) {
    throw new TypeError('Not implemented');
  }
  if (typeof payload !== 'string') {
    message.embeds = payload.embeds?.map(mockEmbed) ?? message.embeds;
    message.content = payload.content ?? message.content;
    message.components =
      payload.components?.map((comp) => mockActionRow(comp)) ?? message.components;
  }

  return message;
}

export function mockMessage(input: {
  client: Client;
  author?: User;
  channel?: TextBasedChannel | undefined;
  override?: Partial<RawMessageData>;
  opts?: MessageOptions;
}): Message<boolean> {
  const { client, opts, override = {} } = input;
  let { author, channel } = input;
  if (!channel) {
    channel = mockTextChannel(client);
  }
  if (!author) {
    author = mockUser(client);
    if (!channel.isDMBased()) {
      mockGuildMember({
        client,
        user: author,
        guild: channel.guild,
      });
    }
  }
  const rawData: RawMessageData = {
    id: randomSnowflake().toString(),
    channel_id: channel.id,
    author: {
      // TODO: Use a helper function to get properties
      id: author.id,
      username: author.username,
      discriminator: author.discriminator,
      avatar: author.avatar,
      global_name: author.username,
    },
    content: '',
    timestamp: '',
    edited_timestamp: null,
    tts: false,
    mention_everyone: false,
    mentions: [],
    mention_roles: [],
    attachments: [],
    embeds: [],
    pinned: false,
    type: MessageType.Default,
    reactions: [],
    ...override,
  };
  const message = Reflect.construct(Message, [client, rawData]) as Message;
  (channel.messages.cache as Collection<Snowflake, Message>).set(message.id, message);
  message.react = async (emoji: EmojiIdentifierResolvable) => {
    const isCustomEmoji = typeof emoji === 'string' && emoji.startsWith('<:');
    if (emoji instanceof GuildEmoji) {
      throw new TypeError('Not implement');
    }
    if (emoji instanceof ReactionEmoji) {
      throw new TypeError('Not implement');
    }
    return await Promise.resolve(
      mockReaction({
        message,
        user: client.user,
        override: {
          emoji: {
            id: isCustomEmoji ? emoji : null,
            name: isCustomEmoji ? null : emoji,
          },
        },
      }),
    );
  };
  message.startThread = async (options: StartThreadOptions) =>
    await Promise.resolve(
      mockThreadFromParentMessage({
        client,
        parentMessage: message,
        data: options,
      }),
    );

  message.edit = (payload) => {
    return Promise.resolve(applyMessagePayload(payload, message));
  };

  message.delete = () => {
    channel?.messages.cache.delete(message.id);
    return Promise.resolve(message);
  };

  if (opts) {
    applyMessagePayload(opts, message);
  }
  return message;
}
