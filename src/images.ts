import { cwd } from "node:process";
import { ImagesOpts } from "./types";
import { extractUrlInfo } from "./regex";
import { allowedSize, globExtension } from "./utils";
import { join } from "node:path";
import { findFiles } from "./fs";
import { convertFile } from "./convert";
import { pipeline } from "node:stream";
import { createReadStream } from "node:fs";
import { Response, Request, NextFunction } from "express";

export default class Images {

	private opts: ImagesOpts = {
		dir: `${cwd()}/images`,
		url: {
			prefix: "/image",
			pattern: "/:dir/:size/:file.:ext"
		},
		allowedSizes: "*",
		allowedFormats: "*",
		limits: {
			width: 1920,
			height: 1080,
		}
	}

	constructor(opts: ImagesOpts) {
		this.opts = {
			...this.opts,
			...opts
		}
	}

	public async middleware(req: Request, res: Response, next: NextFunction) {

		const requestUrl = req.url;
		const urlInfo = extractUrlInfo(requestUrl, this.opts);

		if (urlInfo.err)
			return next();

		const allowed = allowedSize(urlInfo.val.size, this.opts);

		if (!allowed)
			return next();

		const absolutePath = join(this.opts.dir, urlInfo.val.path)
		const { glob, ext } = globExtension(absolutePath)

		if (!ext && urlInfo.val.ext) 
			return next(); /** Format not allowed ¿404? */

		const files = findFiles(glob)
		const candidate = await files.iterate().next()

		if (!candidate.value)
			return res.status(404).send()

		const converter = convertFile(candidate.value, urlInfo.val.size, ext, this.opts)
		
		if (converter.err)
			return next()

		pipeline(createReadStream(candidate.value), converter.val, res)

	}

}
