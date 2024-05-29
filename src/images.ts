import { cwd } from "node:process";
import { ImagesOpts } from "./types";
import { extractUrlInfo } from "./regex";
import { allowedSize, globExtension } from "./utils";
import { join } from "node:path";
import { checkCache, checkFile, findFiles, getCacheWriter } from "./fs";
import { convertFile } from "./convert";
import { createReadStream } from "node:fs";
import { Response, Request, NextFunction } from "express";

export default class Images {

	private opts: ImagesOpts;

	constructor(opts: Partial<ImagesOpts>) {
		this.opts = {
			dir: `${cwd()}/images`,
			url: {
				prefix: "/image",
				pattern: "/:dir/:size/:file.:ext",
			},
			allowedSizes: "*",
			allowedFormats: "*",
			limits: {
				width: 1920,
				height: 1080,
			},
			...opts
		};
	}

	public async middleware(req: Request, res: Response, next: NextFunction) {

		const effects = req.query;
		const requestUrl = req.url.split("?")[0]!;
		const urlInfo = extractUrlInfo(requestUrl, this.opts);

		if (urlInfo.err)
			return next();

		const absolutePath = join(this.opts.dir, urlInfo.val.path)
		const allowed = allowedSize(urlInfo.val.size, this.opts);

		if (!allowed)
			return next(); /** Size not allowed ¿404? */

		const { glob, ext } = globExtension(absolutePath)

		if (ext && !urlInfo.val.ext)
			return next(); /** Format not allowed ¿404? */

		const cachedFile = await checkCache(urlInfo.val.path, this.opts, urlInfo.val.size, effects);

		if (cachedFile.ok)
			return res.status(204).sendFile(cachedFile.val)

		const exactMatch = await checkFile(absolutePath);
		
		let candidate: string | void;
		if (exactMatch.ok)
			candidate = exactMatch.val;
		else {
			const files = findFiles(glob)
			const first = await files.iterate().next()
			candidate = first.value
		}
		
		if (!candidate)
			return res.status(404).send()
		
		const converter = convertFile(candidate, urlInfo.val.size, urlInfo.val.ext, this.opts, effects)

		if (converter.err)
			return next(converter.val)

		if (converter.val.code === 200)
			return res.status(converter.val.code).sendFile(candidate) /** No change */

		const writer = await getCacheWriter(urlInfo.val.path, this.opts, urlInfo.val.size, effects)

		if (writer.err)
			return next(writer.val)

		res.status(converter.val.code).setHeader("Content-Type", converter.val.mime)
		
		createReadStream(candidate)
			.pipe(converter.val.sharp)
			.pipe(writer.val)
			.pipe(res)
	}

}
