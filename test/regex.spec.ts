import { describe, expect, it } from '@jest/globals';
import { extractUrlInfo } from "../src/regex";
import { ImagesOpts } from '../src/types';
import { ImageFormat } from "../src/constants";

describe("extractUrlInfo", () => {

	it("must succeed", () => {
		expect(true).toBe(true);
	})

	it("must return a UrlInfo object given a url and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/100x100/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": "animal",
			"ext": "png",
			"filename": "giraffe",
			"path": "animal/giraffe.png",
			"size": [
			  100,
			  100,
			],
		  });
	})

	it("must fail given a url without size and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/giraffe.png", opts)

		expect(result.err).toBeTruthy();
	})

	it("must return a UrlInfo object only with width given a url without height and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/100x/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": "animal",
			"ext": "png",
			"filename": "giraffe",
			"path": "animal/giraffe.png",
			"size": [
			  100,
			  null,
			],
		  });
	})

	it("must return a UrlInfo object only with height given a url without width and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/x100/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": "animal",
			"ext": "png",
			"filename": "giraffe",
			"path": "animal/giraffe.png",
			"size": [
			  null,
			  100,
			],
		  });
	})

	it("must return a UrlInfo object only without resize given a url with 0x0 size and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/0x0/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": "animal",
			"ext": "png",
			"filename": "giraffe",
			"path": "animal/giraffe.png",
			"size": [
			  null,
			  null,
			],
		  });
	})

	it("must accept UrlInfo objects without extension given a url and a ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/100x100/giraffe", opts)

		expect(result.val).toStrictEqual({
			"dir": "animal",
			"ext": null,
			"filename": "giraffe",
			"path": "animal/giraffe",
			"size": [
			  100,
			  100,
			],
		  });
	})

	it("must ignore size given a pattern without :size in the ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/100x100/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": "animal/100x100",
			"ext": "png",
			"filename": "giraffe",
			"path": "animal/100x100/giraffe.png",
			"size": [
			  null,
			  null,
			],
		  });
	})

	it("must accept UrlInfo objects with images in the root folder", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/./0x0/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": ".",
			"ext": "png",
			"filename": "giraffe",
			"path": "giraffe.png",
			"size": [
			  null,
			  null,
			],
		  });
	})

	it("must accept UrlInfo objects with images in the root folder and a size", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/./100x100/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": ".",
			"ext": "png",
			"filename": "giraffe",
			"path": "giraffe.png",
			"size": [
			  100,
			  100,
			],
		  });
	})

	it("must accept UrlInfo objects with images in the root folder and a size", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/100x100/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": undefined,
			"ext": "png",
			"filename": "giraffe",
			"path": "giraffe.png",
			"size": [
			  100,
			  100,
			],
		  });
	})

	it("must accept UrlInfo objects with a directory depth > 1 ", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/mammals/100x100/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": "animal/mammals",
			"ext": "png",
			"filename": "giraffe",
			"path": "animal/mammals/giraffe.png",
			"size": [
			  100,
			  100,
			],
		  });
	})

	it("must NOT accept not allowed formats", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: new Set<ImageFormat>([ImageFormat.PNG])
		} as ImagesOpts

		const result = extractUrlInfo("/./100x100/giraffe.jpeg", opts)

		expect(result.val).toStrictEqual({
			"dir": ".",
			"ext": "jpeg",
			"filename": "giraffe",
			"path": "giraffe",
			"size": [
			  100,
			  100,
			],
		  });
	})

	it("must accept allowed formats", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: new Set<ImageFormat>([ImageFormat.PNG])
		} as ImagesOpts

		const result = extractUrlInfo("/./100x100/giraffe.png", opts)

		expect(result.val).toStrictEqual({
			"dir": ".",
			"ext": "png",
			"filename": "giraffe",
			"path": "giraffe.png",
			"size": [
			  100,
			  100,
			],
		  });
	})

})
