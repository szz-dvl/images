import { cwd } from "node:process";
import { ImagesOpts } from "./types";
import { extractUrlInfo } from "./regex";
import { allowedSize, globExtension } from "./utils";
import { join } from "node:path";
import { checkCache, checkFile, findFiles, getCacheWriter } from "./fs";
import { convertFile } from "./convert";
import { createReadStream } from "node:fs";
import { Response, Request, NextFunction } from "express";
import { ImageEffect } from "./constants";

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
			allowedEffects: {
				/** Resize */
				[ImageEffect.EXTEND]: 1,
				[ImageEffect.EXTRACT]: 1,
				[ImageEffect.TRIM]: 1,

				/** Operations */
				[ImageEffect.ROTATE]: 1,
				[ImageEffect.FLIP]: 1,
				[ImageEffect.FLOP]: 1,
				[ImageEffect.AFFINE]: 1,
				[ImageEffect.SHARPEN]: 1,
				[ImageEffect.MEDIAN]: 1,
				[ImageEffect.BLUR]: 1,
				[ImageEffect.FLATTEN]: 1,
				[ImageEffect.UNFLATTEN]: 1,
				[ImageEffect.GAMMA]: 1,
				[ImageEffect.NEGATE]: 1,
				[ImageEffect.NORMALISE]: 1,
				[ImageEffect.CLAHE]: 1,
				[ImageEffect.CONVOLVE]: 1,
				[ImageEffect.THRESHOLD]: 1,
				[ImageEffect.BOOLEAN]: 1,
				[ImageEffect.LINEAR]: 1,
				[ImageEffect.RECOMB]: 1,
				[ImageEffect.MODULATE]: 1,

				/** Color */
				[ImageEffect.TINT]: 1,
				[ImageEffect.GRAYSCALE]: 1,
				[ImageEffect.PIPELINECOLORSPACE]: 1,
				[ImageEffect.TOCOLORSPACE]: 1,

				/** Channel */
				[ImageEffect.REMOVEALPHA]: 1,
				[ImageEffect.ENSUREALPHA]: 1,
				[ImageEffect.EXTRACTCHANNEL]: 1,
				[ImageEffect.JOINCHANNEL]: 1,
				[ImageEffect.BANDBOOL]: 1,
			},
			limits: {
				width: 1920,
				height: 1080,
			},
			...opts
		};
	}

	public async middleware(req: Request, res: Response, next: NextFunction) {

		try {

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

		} catch (err) {
			return next(err)
		}
	}
}
