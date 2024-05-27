import { cwd } from "node:process";
import { createDirIfNotExists } from "./fs";
import { ImagesOpts } from "./types";

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
		},
		quality: {
			webp: 80,
			avif: 80,
		}
	}

	constructor(opts: ImagesOpts) {
		this.opts = {
			...this.opts,
			...opts
		}
	}

	public async init() {
		await createDirIfNotExists(this.opts.dir);
	}

	public async middleware(req: Request, res: Response, next: (err?: Error) => {}) {

		const requestUrl = req.url;

		if (!requestUrl.startsWith(this.opts.url.prefix))
			next()



	}

}
