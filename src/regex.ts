import { ImageFormat, ImageSize, ImagesOpts } from "./types";
import { join } from "node:path";
import { getAllowedExtension } from "./utils"

export type UrlInfo = {
    path: string,
    dir: string,
    size: ImageSize,
    filename: string,
    ext: string | null
}

export const extractUrlInfo = (url: string, { url: { pattern }, allowedFormats }: ImagesOpts): UrlInfo | null => {

    /* https://github.com/shopsinc/imgr/blob/master/lib/server.js#L308 */

    const patternMatch = pattern.replace(/\./g, '(?:\\.)?');
    const constrainMatch = /:(dir|size|file|ext)/g
    const parsed: Record<string, string> = {}
    let match;

    while ((match = constrainMatch.exec(patternMatch))) {

        const constrain = match[1];
        let regex;

        switch (constrain) {
            case "size": {
                const urlPattern = patternMatch
                    .replace(":size", "(\\d+x{1}|x{1}\\d+|\\d+x{1}\\d+)")
                    .replace("/:dir", ".*")
                    .replace(":file", ".*")
                    .replace(":ext", ".*")

                regex = new RegExp('^' + urlPattern + '$');
            }
            break;
            case "dir": {
                const urlPattern = patternMatch
                    .replace("/:dir", "(?:/([^/]+))?")
                    .replace("/:size", ".*")
                    .replace(":file", ".*")
                    .replace(":ext", ".*")

                regex = new RegExp('^' + urlPattern + '$');
            }
            break;
            case "file": {
                const urlPattern = patternMatch
                    .replace(":file", "([^/.]+)")
                    .replace("/:size", ".*")
                    .replace(":dir", ".*")
                    .replace(":ext", ".*")

                regex = new RegExp('^' + urlPattern + '$');
            }
            break;
            case "ext": {
                const urlPattern = patternMatch
                    .replace(":ext", "(?<=\\.)([^/]+?)")
                    .replace("/:size", ".*")
                    .replace(":dir", ".*")
                    .replace(":file", ".*")

                regex = new RegExp('^' + urlPattern + '$');
            }
            break;
            default:
                break;
        }

        const dataMatch = url.match(regex!);

        if (!dataMatch) {
            continue;
        }   
            
        parsed[constrain] = dataMatch[1];

    }

    const allowedExt = getAllowedExtension(parsed.ext, allowedFormats);

    const result: UrlInfo = {
        path: join(parsed.dir || '', parsed.file + (allowedExt ? ('.' + allowedExt) : '')),
        dir: parsed.dir,
        size: parsed.size ? parsed.size.split('x', 2).map(s => s ? Number(s) : null) as ImageSize : [null, null],
        filename: parsed.file,
        ext: parsed.ext || null
    }

    return result;
}
