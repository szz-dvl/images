import { cwd } from "node:process";
import { ImagesOpts } from "./types";
import { extractUrlInfo } from "./regex";
import { allowedSize, globExtension } from "./utils";
import { join } from "node:path";
import { checkCache, checkFile, findFiles, getCacheWriter } from "./fs";
import { convertFile } from "./convert";
import { Writable, pipeline } from "node:stream";
import { close, createReadStream, open, write } from "node:fs";
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

		const requestUrl = req.url;
		const urlInfo = extractUrlInfo(requestUrl, this.opts);

		if (urlInfo.err)
			return next();

		const absolutePath = join(this.opts.dir, urlInfo.val.path)
		const exactMatch = await checkFile(absolutePath);
		
		if (exactMatch.ok)
			return res.status(200).sendFile(exactMatch.val);

		const allowed = allowedSize(urlInfo.val.size, this.opts);

		if (!allowed)
			return next(); /** Size not allowed ¿404? */

		const cachedFile = await checkCache(urlInfo.val.path, this.opts, urlInfo.val.size);

		if (cachedFile.ok)
			return res.status(204).sendFile(cachedFile.val)

		const { glob, ext } = globExtension(absolutePath)

		if (ext && !urlInfo.val.ext)
			return next(); /** Format not allowed ¿404? */

		const files = findFiles(glob)
		const candidate = await files.iterate().next()

		if (!candidate.value)
			return res.status(404).send()

		if (!urlInfo.val.ext)
			return res.status(200).sendFile(candidate.value)

		const converter = convertFile(candidate.value, urlInfo.val.size, urlInfo.val.ext, this.opts)

		if (converter.err)
			return next()

		const writer = await getCacheWriter(urlInfo.val.path, this.opts, urlInfo.val.size)

		if (writer.err)
			return next(writer.val)

		writer.val.writer.on("close", () => {
			/** */
			return res.status(201).sendFile(writer.val.filename)
		})
		
		createReadStream(candidate.value)
			.pipe(converter.val)
			.pipe(writer.val.writer);
	}

}
