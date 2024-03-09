import {
  type APIBaseInteraction,
  type APIChatInputApplicationCommandInteraction,
  APIMessageButtonInteractionData,
  APIMessageComponentInteraction,
  type APIMessageStringSelectInteractionData,
  ApplicationCommandType,
  ButtonInteraction,
  CacheType,
  type Channel,
  ChatInputCommandInteraction,
  Client,
  ComponentType,
  GuildMember,
  GuildMemberFlags,
  type GuildTextBasedChannel,
  type Interaction,
  InteractionResponse,
  InteractionType,
  type InteractionUpdateOptions,
  Message,
  MessagePayload,
  PermissionsBitField,
  type Snowflake,
  StringSelectMenuInteraction,
  User,
} from 'discord.js';

import { mockTextChannel } from './channel-mock.js';
import { mockMessage } from './message-mock.js';
import { messageToAPIData } from './to-api-data.js';
import { mockGuildMember } from './user-mock.js';
import { randomSnowflake } from './utils/snowflake.js';

function setupMockedInteractionAPIData<Type extends InteractionType>({
  channel,
  caller,
  message = undefined,
  type,
  applicationId = undefined,
  override = {},
}: {
  applicationId?: string;
  channel: Channel;
  message?: Message;
  caller: User;
  type: Type;
  override?: Partial<APIBaseInteraction<Type, object>>;
}): Omit<Required<APIBaseInteraction<Type, object>>, 'guild_id' | 'message' | 'member'> &
  Pick<APIBaseInteraction<Type, object>, 'guild_id' | 'message' | 'member'> {
  const guild = channel.isDMBased() ? undefined : channel.guild;
  let appPermissions = null;
  let memberPermissions = null;
  if (guild) {
    appPermissions = guild.members.cache
      .get(channel.client.user.id)
      .permissions.bitfield.toString();
    memberPermissions = guild.members.cache.get(caller.id).permissions.bitfield.toString();
  }
  return {
    application_id: applicationId ?? randomSnowflake().toString(),
    channel_id: channel.id,
    channel: {
      id: channel.id,
      type: channel.type,
    },
    id: randomSnowflake().toString(),
    token: randomSnowflake().toString(), // TODO: Use a real token
    version: 1,
    app_permissions: appPermissions ?? PermissionsBitField.Default.toString(),
    locale: 'en-US',
    guild_id: channel.isDMBased() ? undefined : channel.guild.id,
    user: {
      id: caller.id,
      avatar: caller.avatar,
      discriminator: caller.discriminator,
      username: caller.username,
      global_name: caller.username,
    },
    member: guild
      ? {
          deaf: false,
          flags: GuildMemberFlags.CompletedOnboarding,
          joined_at: guild.members.cache.get(caller.id).joinedAt.toISOString(),
          mute: false,
          permissions: memberPermissions ?? PermissionsBitField.Default.toString(),
          roles: guild.members.cache.get(caller.id).roles.cache.map((r) => r.id),
          user: {
            id: caller.id,
            avatar: caller.avatar,
            discriminator: caller.discriminator,
            username: caller.username,
            global_name: caller.username,
          },
          avatar: caller.avatar,
        }
      : undefined,
    data: {},
    guild_locale: 'en-US',
    message: message ? messageToAPIData(message) : undefined,
    type,
    entitlements: [], // Add the missing 'entitlements' property
    ...override,
  };
}

function applyInteractionResponseHandlers(interaction: Interaction): void {
  const { client } = interaction;
  if ('update' in interaction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    interaction.update = async (
      options:
        | (InteractionUpdateOptions & { fetchReply: true })
        | (string | MessagePayload | InteractionUpdateOptions),
    ) => {
      interaction.deferred = false;
      interaction.replied = true;
      const { message, id } = interaction;
      await message.edit(options);
      if (options instanceof Object && 'fetchReply' in options) {
        return await Promise.resolve(message);
      }
      return mockInteractionResponse({
        interaction: interaction,
        id: id,
      });
    };
  }
  if ('deferUpdate' in interaction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    interaction.deferUpdate = (options) => {
      interaction.deferred = true;
      if (options?.fetchReply) {
        return Promise.resolve(interaction.message);
      }
      return Promise.resolve(
        mockInteractionResponse({
          id: interaction.id,
          interaction,
        }),
      );
    };
  }

  if ('deferReply' in interaction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    interaction.deferReply = (options) => {
      interaction.deferred = true;
      const message = mockMessage({
        client,
        channel: interaction.channel ?? undefined, // TODO: probably error here?
        author: interaction.client.user,
        override: {
          id: interaction.id.toString(),
        },
      });
      if (options?.fetchReply) {
        return Promise.resolve(message);
      }
      return Promise.resolve(
        mockInteractionResponse({
          id: interaction.id,
          interaction,
        }),
      );
    };
  }

  if ('reply' in interaction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    interaction.reply = (options) => {
      const message = mockMessage({
        client,
        channel: interaction.channel ?? undefined, // TODO: probably error here?
        author: interaction.client.user,
        override: {
          id: interaction.id.toString(),
        },
        opts: options,
      });
      interaction.deferred = false;
      interaction.replied = true;

      if (options instanceof Object && 'fetchReply' in options) {
        return Promise.resolve(message);
      }

      return Promise.resolve(
        mockInteractionResponse({
          interaction: interaction,
          id: interaction.id,
        }),
      );
    };
  }
  if ('followUp' in interaction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    interaction.followUp = (options) => {
      const message = mockMessage({
        client,
        channel: interaction.channel ?? undefined, // TODO: probably error here?
        author: interaction.client.user,
        override: {
          id: interaction.id.toString(),
        },
        opts: options,
      });
      interaction.deferred = false;
      interaction.replied = true;

      if (options instanceof Object && 'fetchReply' in options) {
        return Promise.resolve(message);
      }

      return Promise.resolve(
        mockInteractionResponse({
          interaction: interaction,
          id: interaction.id,
        }),
      );
    };
  }
  if ('fetchReply' in interaction) {
    interaction.fetchReply = () => {
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const message = interaction.channel?.messages.cache.get(interaction.id);
        if (!message) {
          throw new Error('Message not found');
        }
        return Promise.resolve(message);
      } else {
        if (!interaction.message) {
          throw new Error('No message to edit');
        }
        return Promise.resolve(interaction.message);
      }
    };
  }

  if ('editReply' in interaction) {
    interaction.editReply = async (options) => {
      interaction.deferred = false;
      interaction.replied = true;
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const message = await interaction.fetchReply();
        return await message.edit(options);
      } else {
        if (!interaction.message) {
          throw new Error('No message to edit');
        }
        return await interaction.message?.edit(options);
      }
    };
  }
}

export function mockChatInputCommandInteraction({
  client,
  name,
  id,
  channel,
  member,
}: {
  client: Client;
  name: string;
  id: string;
  channel?: GuildTextBasedChannel;
  member?: GuildMember;
}): ChatInputCommandInteraction {
  if (!channel) {
    channel = mockTextChannel(client);
  }
  if (!member) {
    member = mockGuildMember({ client, guild: channel.guild });
  }
  const rawData: APIChatInputApplicationCommandInteraction = {
    ...setupMockedInteractionAPIData({
      caller: member.user,
      channel,
      type: InteractionType.ApplicationCommand,
      applicationId: id,
    }),
    data: {
      id,
      name,
      type: ApplicationCommandType.ChatInput,
      guild_id: channel.guild.id,
    },
  };
  // TODO: Look into adding command to client cache
  const command = Reflect.construct(ChatInputCommandInteraction, [
    client,
    rawData,
  ]) as ChatInputCommandInteraction;
  applyInteractionResponseHandlers(command);
  return command;
}

export function mockInteractionResponse({
  interaction,
  id,
}: {
  interaction: Interaction;
  id: Snowflake;
}): InteractionResponse {
  return Reflect.construct(InteractionResponse, [interaction, id]) as InteractionResponse;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function mockButtonInteraction({
  override = {},
  caller,
  message,
}: {
  caller: User;
  message: Message;
  override?: Partial<
    Omit<APIMessageButtonInteractionData & APIMessageComponentInteraction, 'component_type'>
  >;
}) {
  const { client, channel } = message;
  const customId = override.custom_id ?? randomSnowflake().toString();
  const rawData = {
    component_type: ComponentType.Button,
    custom_id: customId,
    message: messageToAPIData(message),
    ...override,
    ...setupMockedInteractionAPIData({
      caller,
      channel: channel,
      type: InteractionType.MessageComponent,
      message,
      override,
    }),
    data: {
      component_type: ComponentType.Button,
      custom_id: customId,
    },
  } satisfies APIMessageButtonInteractionData & APIMessageComponentInteraction;
  const interaction = Reflect.construct(ButtonInteraction, [client, rawData]) as ButtonInteraction;
  applyInteractionResponseHandlers(interaction);
  return interaction;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function mockStringSelectInteraction({
  override = {},
  caller,
  message,
  data,
}: {
  caller: User;
  message: Message;
  data: Omit<APIMessageStringSelectInteractionData, 'component_type' | 'values'> & {
    values: string[] | string;
  };
  override?: Partial<Omit<APIMessageComponentInteraction, 'data'>>;
}): StringSelectMenuInteraction<CacheType> {
  const { client, channel } = message;
  const rawData = {
    message: messageToAPIData(message),
    ...override,
    ...setupMockedInteractionAPIData({
      caller,
      channel: channel,
      type: InteractionType.MessageComponent,
      message,
      override,
    }),
    data: {
      component_type: ComponentType.StringSelect,
      custom_id: data.custom_id,
      values: Array.isArray(data.values) ? data.values : [data.values],
    },
  } satisfies APIMessageComponentInteraction & {
    data: APIMessageStringSelectInteractionData;
  };
  const interaction = Reflect.construct(StringSelectMenuInteraction, [
    client,
    rawData,
  ]) as StringSelectMenuInteraction;
  applyInteractionResponseHandlers(interaction);
  return interaction;
}
