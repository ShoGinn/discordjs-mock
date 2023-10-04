import { SnowflakeUtil } from 'discord.js';

import {
	getRandomTime,
	isSnowflakeLarger,
	isSnowflakeLargerAsInt,
	randomSnowflake,
	randomSnowflakeLargerThan,
} from './snowflake.js';
describe('getRandomTime', () => {
	it('should return a random date between start and end', () => {
		const start = new Date(2021, 0, 1);
		const end = new Date(2021, 0, 31);
		const randomDate = getRandomTime(start, end);
		expect(randomDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
		expect(randomDate.getTime()).toBeLessThanOrEqual(end.getTime());
	});

	it('should return a random date between 2015-01-01 and now if no arguments are provided', () => {
		const randomDate = getRandomTime();
		expect(randomDate.getTime()).toBeGreaterThanOrEqual(
			new Date(2015, 0, 1).getTime(),
		);
		expect(randomDate.getTime()).toBeLessThanOrEqual(Date.now());
	});
});

describe('randomSnowflake', () => {
	it('should generate a valid snowflake', () => {
		const snowflake = randomSnowflake();
		expect(SnowflakeUtil.deconstruct(snowflake.toString())).toBeDefined();
	});
});

describe('randomSnowflakeLargerThan', () => {
	it('should generate a snowflake larger than the given snowflake', () => {
		const start = SnowflakeUtil.generate();
		const end = randomSnowflakeLargerThan(start);
		expect(isSnowflakeLarger(start, end)).toBe(false);
	});
});

describe('isSnowflakeLargerAsInt', () => {
	it('should return -1 if small is larger than large', () => {
		const small = SnowflakeUtil.generate();
		const large = randomSnowflakeLargerThan(small);
		expect(isSnowflakeLargerAsInt(small, large)).toBe(-1);
	});

	it('should return 1 if small is smaller than large', () => {
		const small = SnowflakeUtil.generate();
		const large = randomSnowflakeLargerThan(small);
		expect(isSnowflakeLargerAsInt(large, small)).toBe(1);
	});
});

describe('isSnowflakeLarger', () => {
	it('should return false if small is smaller than large', () => {
		const small = SnowflakeUtil.generate();
		const large = randomSnowflakeLargerThan(small);
		expect(isSnowflakeLarger(small, large)).toBe(false);
	});

	it('should return true if small is larger than large', () => {
		const small = SnowflakeUtil.generate();
		const large = randomSnowflakeLargerThan(small);
		expect(isSnowflakeLarger(large, small)).toBe(true);
	});

	it('should return false if small and large are equal', () => {
		const snowflake = SnowflakeUtil.generate();
		expect(isSnowflakeLarger(snowflake, snowflake)).toBe(false);
	});
});
