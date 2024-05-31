import { ImageSize, ImagesOpts } from "./types";
import { ImageEffect, ImageFormat, ImageMimeType } from "./constants";
import sharp, { Sharp, SharpOptions } from "sharp";
import { Err, Ok, Result } from "ts-results";
import { CachePathState, getAllowedExtension, getFormatMimeType, pruneExtension } from "./utils";
import { extname } from "path";
import { EffectState, applyImageEffects } from "./imageEffects";
import { ParsedQs } from "qs";
import { getExtractAfterOptions, getResizeOptions } from "./options";
import { applyExtractEffect } from "./effects";

type ConvertResult = {
    sharp: Sharp,
    code: number,
    mime: ImageMimeType
}

const applyExtractAfterEffect = (converter: Sharp, effects: ParsedQs, state: EffectState, cachePath: CachePathState, logs: boolean): void => {

    let idx = 0;
    while (state[ImageEffect.EXTRACT] > 0) {

        const extractAfter = getExtractAfterOptions("_".repeat(idx++), effects, cachePath);
        if (extractAfter.err)
            break;

        if (logs)
            console.log(`Applying effect: extractAfter`);

        applyExtractEffect(converter, extractAfter.val);
        state[ImageEffect.EXTRACT] -= 1;
    }
}

export const convertFile = (from: string | void, options: SharpOptions, [width, height]: ImageSize, ext: ImageFormat | null, { formatOpts, allowedEffects, logs }: ImagesOpts, effects: ParsedQs, cachePath: CachePathState): Result<ConvertResult, Error> => {

    try {
        let code = 200, mime = ImageMimeType.ANY;

        const converter = sharp(options).keepMetadata();

        const effectsResult = applyImageEffects(converter, effects, allowedEffects, cachePath, logs);

        if (effectsResult.err)
            return effectsResult;

        code = effectsResult.val.code;

        if (width !== null || height !== null) {

            code = 201;

            if (logs)
                console.log(`Resizing file ${from} to ${width || 0}x${height || 0}`);

            const opts = getResizeOptions(effects, cachePath);
            converter.resize(width, height, opts);

        }

        applyExtractAfterEffect(converter, effects, effectsResult.val.state, cachePath, logs);

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

            if (logs)
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