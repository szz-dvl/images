import { describe, expect, it } from '@jest/globals';
import { extractUrlInfo } from "../src/regex";
import { ImageFormat, ImagesOpts } from '../src/types';

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

		expect(result).toStrictEqual({
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

	it("must return a UrlInfo object without size given a url without size and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/giraffe.png", opts)

		expect(result).toStrictEqual({
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

	it("must return a UrlInfo object only with width given a url without height and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/100x/giraffe.png", opts)

		expect(result).toStrictEqual({
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

		expect(result).toStrictEqual({
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

	it("must accept UrlInfo objects without extension given a url and an ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/100x100/giraffe", opts)

		expect(result).toStrictEqual({
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

	it("must NOT accept UrlInfo objects with size given a pattern without :size in the ImagesOpts object", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/animal/100x100/giraffe.png", opts)

		expect(result).toStrictEqual({
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

	it("must accept UrlInfo objects with images in the root folder", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:file.:ext"
			},
			allowedFormats: "*"
		} as ImagesOpts

		const result = extractUrlInfo("/./100x100/giraffe.png", opts)

		expect(result).toStrictEqual({
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

		expect(result).toStrictEqual({
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

	it("must NOT accept not allowed formats", () => {
		const opts : ImagesOpts = {
			url: {
				pattern: "/:dir/:size/:file.:ext"
			},
			allowedFormats: new Set<ImageFormat>([ImageFormat.PNG])
		} as ImagesOpts

		const result = extractUrlInfo("/./100x100/giraffe.jpeg", opts)

		expect(result).toStrictEqual({
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

		expect(result).toStrictEqual({
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
