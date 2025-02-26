// Mock crypto.randomUUID
(global.crypto as any) = {
	...(global.crypto as any),
	randomUUID: () => '00000000-0000-0000-0000-000000000000'
};

// Mock TypeDI
jest.mock('typedi', () => ({
	Service: () => jest.fn(),
	Inject: () => jest.fn(),
	Container: {
		get: jest.fn()
	}
}));

// Mock result
jest.mock('@infrastructure/core/result', () => {
	return {
		Result: {
			success: jest.fn((data: any) => ({
				isSuccess: () => true,
				isFailure: () => false,
				getValue: () => data
			})),
			failure: jest.fn((error: string) => ({
				isSuccess: () => false,
				isFailure: () => true,
				getError: () => error
			}))
		}
	};
});