import { ImageSize, ImagesOpts } from "./types";
import { ImageFormat, ImageMimeType } from "./constants";
import sharp, { Sharp, SharpOptions } from "sharp";
import { Err, Ok, Result } from "ts-results";
import { CachePathState, getAllowedExtension, getFormatMimeType, pruneExtension } from "./utils";
import { extname } from "path";
import { applyImageEffects } from "./imageEffects";
import { ParsedQs } from "qs";
import { getResizeOptions } from "./options";

type ConvertResult = {
    sharp: Sharp,
    code: number,
    mime: ImageMimeType
}

export const convertFile = (from: string | void, options: SharpOptions, [width, height]: ImageSize, ext: ImageFormat | null, { formatOpts, allowedEffects }: ImagesOpts, effects: ParsedQs, cachePath: CachePathState): Result<ConvertResult, Error> => {

    try {
        let code = 200, mime = ImageMimeType.ANY;

        const converter = sharp(options).keepMetadata();

        const effectsResult = applyImageEffects(converter, effects, allowedEffects, cachePath);

        if (effectsResult.err)
            return effectsResult;

        code = effectsResult.val;

        if (width !== null || height !== null) {

            code = 201;
            console.log(`Resizing file ${from} to ${width || 0}x${height || 0}`);

            const opts = getResizeOptions(effects, cachePath);
            converter.resize(width, height, opts);

        }

        const candidateExtension = from ? getAllowedExtension(
            pruneExtension(
                extname(from)
            ),
            "*" /** Force all known extensions here, in case the configuration changed over time */
        ) : Ok(null);

        if (candidateExtension.err)
            return candidateExtension;

        if (ext && candidateExtension.val !== ext) {

            if (ext === ImageFormat.SVG)
                return Err(new Error("Bad target format", { cause: ext }));

            code = 201;
            mime = getFormatMimeType(ext);
            console.log(`Converting file ${from} to ${ext}`);

            switch (ext) {
                case ImageFormat.PNG: {
                    converter.png(formatOpts?.png)
                }
                    break;
                case ImageFormat.AVIF: {
                    converter.avif(formatOpts?.avif)
                }
                    break;
                case ImageFormat.WEBP: {
                    converter.webp(formatOpts?.webp)
                }
                    break;
                case ImageFormat.JPEG: {
                    converter.jpeg(formatOpts?.jpeg)
                }
                    break;
                case ImageFormat.GIF: {
                    converter.gif(formatOpts?.gif)
                }
                    break;
                case ImageFormat.TIFF: {
                    converter.tiff(formatOpts?.tiff)
                }
                    break;
                case ImageFormat.JP2: {
                    converter.jp2(formatOpts?.jp2)
                }
                    break;
                case ImageFormat.HEIF: {
                    converter.heif(formatOpts?.heif)
                }
                    break;
            }

        } else {

            if (!ext) {

                /**
                 * If we reach here without an extension, a particular format was not requested, we need to compute the extension of the candidate 
                 * to update the one that will be used for cached files.
                 */

                if (candidateExtension.val === null) {

                    /* This case must never happens. */

                    return Err(new Error("Missing extension for cached file", { cause: candidateExtension }));
                }

                cachePath(undefined, candidateExtension.val)
            }

            /** Only meaningful when 201 code, when resize/effect and no conversion */

            mime = getFormatMimeType(candidateExtension.val);
        }

        return Ok({ sharp: converter, code, mime });

    } catch (err) {
        return Err(err as Error)
    }
}