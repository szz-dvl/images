import { ImageSize } from "./types";
import { join } from "node:path";
import { getAllowedExtension } from "utils"

export type UrlInfo = {
    path: string,
    dir: string,
    size: ImageSize,
    filename: string,
    ext: ImageFormat | null
}

export const extractUrlInfo = (url: string, { url: { pattern }, allowedFormats }: ImagesOpts): UrlInfo | null => {

    /* https://github.com/shopsinc/imgr/blob/master/lib/server.js#L308 */
    
    const constrains = [];
    const patternMatch = pattern.replace(/\(/g, '(?:').replace(/\./g, '\\.');
    const constrainMatch = /:(dir|size|file|ext)/g
    
    while ((let match = constrainMatch.exec(patternMatch))) {
	constrains.push(match[1]);
    }

    const urlPattern = patternMatch
	.replace(":size", "(\\d+x{1}|x{1}\\d+|\\d+x{1}\\d+)")
	.replace("/:dir", "(?:/(.+?))?")
	.replace(":file", "([^/]+?)")
	.replace(":ext", "([^/]+?)")

    const regex = new RegExp('^' + urlPattern + '$'); 

    const match = url.match(regex);
    
    if (!match) {
	return null;
    }

    const parsed: Record<string, string> = {}

    for (let i = 0; i < constrains.length; i++) {
	parsed[constrains[i]] = match[i+1];
    }

    const result: UrlInfo = {
	path: path.join(parsed.dir || '', parsed.file + '.' + parsed.ext),
	dir: parsed.dir,
	size: parsed.size.split('x', 2).map(s => s ? Number(s) : null),
	filename: parsed.file,
	ext: getAllowedExtension(parsed.ext, allowedFormats)
    }

    return result;
}
