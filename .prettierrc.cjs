// eslint-disable-next-line no-undef, @typescript-eslint/no-unsafe-assignment
module.exports = {
	// eslint-disable-next-line no-undef
	endOfLine: 'lf',
	quoteProps: 'as-needed',
	semi: true,
	singleQuote: true,
	tabWidth: 2,
	printWidth: 80,
	trailingComma: 'all',
	useTabs: true,
	overrides: [
		{
			files: '.all-contributorsrc',
			options: {
				parser: 'json',
			},
		},
		{
			files: '*.yml',
			options: {
				tabWidth: 2,
				useTabs: false,
			},
		},
		{
			files: '*.json',
			options: {
				parser: 'json',
				trailingComma: 'none',
			},
		},
	],
};
