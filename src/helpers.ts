import {
  Client,
  type ClientEvents,
  PermissionFlagsBits,
  type PermissionResolvable,
} from 'discord.js';

// Bit of a hack of a helper function to give async tasks that aren't tracked time to run. A better approach would be to listen to dispatched events
export async function delay(timeInMs?: number): Promise<void> {
  if (!timeInMs) {
    timeInMs = process.env['DEFAULT_DELAY_IN_MS']
      ? Number.parseInt(process.env['DEFAULT_DELAY_IN_MS'])
      : 500;
  }
  await new Promise((resolve) => setTimeout(resolve, timeInMs));
}

export async function emitEvent<E extends keyof ClientEvents>(
  client: Client,
  event: E,
  ...arguments_: ClientEvents[E]
): Promise<boolean> {
  const status = client.emit(event, ...arguments_);
  await delay();
  return status;
}

export function overrideVariables<T extends object>(object: T, overrides: object): void {
  Object.assign(object, overrides);
}

export function copyClass<T extends { client: Client }>(
  object: T,
  client: Client,
  overrides: object = {},
): T {
  const created = Object.assign(
     
    Object.create(Object.getPrototypeOf(object)),
    object,
  ) as T;
  overrideVariables(created, { client, ...overrides });
  return created;
}

export interface PermissionVariantsTest {
  permissionsThatShouldWork: PermissionResolvable[];
  operation: (
    permission: PermissionResolvable,
    isPermissionAllowed: boolean,
  ) => Promise<void> | void;
}

export async function testAllPermissions({
  permissionsThatShouldWork,
  operation,
}: PermissionVariantsTest): Promise<void> {
  // Possibly swap to Promise.All - going in parallel break things sometimes
  for await (const permission of Object.keys(PermissionFlagsBits)) {
    const permissionIsAllowed = permissionsThatShouldWork.includes(
      permission as PermissionResolvable,
    );
    await operation(permission as PermissionResolvable, permissionIsAllowed);
  }
}
