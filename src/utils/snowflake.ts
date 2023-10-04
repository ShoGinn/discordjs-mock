import { type Snowflake, SnowflakeUtil } from 'discord.js';
export function getRandomTime(start?: Date, end?: Date): Date {
	if (!start) {
		start = new Date(2015, 0, 1);
	}
	if (!end) {
		end = new Date();
	}
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

export function randomSnowflake(start?: Date, end?: Date): bigint {
	return SnowflakeUtil.generate({ timestamp: getRandomTime(start, end) });
}

export function randomSnowflakeLargerThan(start: Snowflake | bigint): bigint {
	return SnowflakeUtil.generate({
		timestamp: new Date(SnowflakeUtil.timestampFrom(start) + 1000),
	});
}

export function isSnowflakeLargerAsInt(
	small: Snowflake | bigint,
	large: Snowflake | bigint,
): 1 | -1 {
	return isSnowflakeLarger(small, large) ? 1 : -1;
}

export function isSnowflakeLarger(
	small: Snowflake | bigint,
	large: Snowflake | bigint,
): boolean {
	const smallAsBigInt = BigInt(small);
	const largeAsBigInt = BigInt(large);
	return smallAsBigInt > largeAsBigInt;
}
