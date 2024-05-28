import { cwd } from "node:process";
import { ImagesOpts } from "./types";
import { extractUrlInfo } from "./regex";
import { allowedSize, globExtension } from "./utils";
import { join } from "node:path";
import { findFiles } from "./fs";
import { convertFile } from "./convert";
import { pipeline } from "node:stream";
import { createReadStream } from "node:fs";
import { ServerResponse } from "node:http";

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

	public async middleware(req: Request, res: ServerResponse, next: (err?: Error) => {}) {

		const requestUrl = req.url;
		const urlInfo = extractUrlInfo(requestUrl, this.opts);

		if (!urlInfo)
			return next();

		const allowed = allowedSize(urlInfo.size, this.opts);

		if (!allowed)
			return next();

		const absolutePath = join(this.opts.dir, urlInfo.path)
		const { glob, ext } = globExtension(absolutePath)

		if (!ext && urlInfo.ext) 
			return next(); /** Format not allowed ¿404? */

		const files = findFiles(glob)
		const candidate = await files.iterate().next()

		const converter = convertFile(candidate.value, urlInfo.size, ext, this.opts)
		
		if (!converter)
			return next()

		pipeline(createReadStream(candidate.value!), converter, res)

	}

}
