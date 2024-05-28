import { ImageSize, ImagesOpts } from "./types";
import { join } from "node:path";
import { getAllowedExtension } from "./utils"
import { Err, Ok, Result } from "ts-results";
import { ImageFormat } from "./constants";

export type UrlInfo = {
    path: string,
    dir: string,
    size: ImageSize,
    filename: string,
    ext: ImageFormat | null
}

export const extractUrlInfo = (url: string, { url: { pattern }, allowedFormats }: ImagesOpts): Result<UrlInfo, Error> => {

    /* https://github.com/shopsinc/imgr/blob/master/lib/server.js#L308 */

    const constrains = [];
    const patternMatch = pattern.replace(/\./g, '(?:\\.)?');
    const constrainMatch = /:(dir|size|file|ext)/g
    const parsed: Record<string, string> = {}
    let match;

    while ((match = constrainMatch.exec(patternMatch))) {
        constrains.push(match[1]);
    }

    const urlPattern = patternMatch
        .replace("/:dir", "(?:/(.+?))?")
        .replace(":size", "(\\d+x{1}|x{1}\\d+|\\d+x{1}\\d+)")
        .replace(":file", "([^/.]+)")
        .replace(":ext", "(?<=(?:\\.)?)([^/.]*?)")

    const regex = new RegExp('^' + urlPattern + '$');
    match = regex.exec(url);

    if (!match) {
        return Err(new Error("Bad URL", { cause: url }));
    }

    let idx = 0;
    for (const constrain of constrains) {
        parsed[constrain] = match[idx + 1];
        idx ++;
    }

    const allowedExt = getAllowedExtension(parsed.ext, allowedFormats);

    const result: UrlInfo = {
        path: join(parsed.dir || '', parsed.file + (parsed.ext ? ('.' + parsed.ext) : '')),
        dir: parsed.dir,

        /* 0x0 for no resize */
        size: parsed.size ? parsed.size.split('x', 2).map(s => s && s !== "0" ? Number(s) : null) as ImageSize : [null, null],

        filename: parsed.file,
        ext: allowedExt.err ? null : allowedExt.val
    }

    return Ok(result);
}
