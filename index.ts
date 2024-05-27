import { ImageSize } from "./types";
import { cwd } from "node:os";

export type FormatsQuality {
    webp?: number,
    avif?: number
}

export type ImageUrlPattern {
    prefix: string,
    pattern: string,
}

export type ImageLimits {
    width: number,
    height: number,
}

export type ImagesOpts {
    dir: string,
    url: ImageUrlPattern,
    allowedSizes: Set<ImageSize> | "*",
    allowedFormats: Set<ImageFormat> | "*",
    limits: ImageLimits,
    quality?: FormatsQuality
}

export default class Images {

    private opts: ImageOpts = {
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

    public async middleware(req, res, next) {

	const requestUrl = req.url;

	if (!requestUrl.startsWith(this.opts.url.prefix))
	    next()
	
	
	
    }

}
