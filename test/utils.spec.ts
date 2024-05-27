import { describe, expect, it } from '@jest/globals';
import { getAllowedExtension } from '../src/utils';

describe("getAllowedExtension", () => {

	it("must succeed", () => {
		expect(true).toBe(true);
	})

	it("Must return a valid extension if a valid string is provided", () => {
		const result = getAllowedExtension("png", '*')

        expect(result).toBe("png")
	})

    it("Must accept JPG as JPEG", () => {
		const result = getAllowedExtension("jpg", '*')

        expect(result).toBe("jpeg")
	})

})
