import { ImageSize, ImagesOpts } from "./types";
import { ImageFormat, ImageMimeType } from "./constants";
import sharp, { Sharp } from "sharp";
import { Err, Ok, Result } from "ts-results";
import { getAllowedExtension, getFormatMimeType, pruneExtension } from "./utils";
import { extname } from "path";
import { applyImageEffects } from "./effects";
import { ParsedQs } from "qs";

export type ConvertResult = {
    sharp: Sharp,
    code: number,
    mime: ImageMimeType
}

export const convertFile = (from: string, [width, height]: ImageSize, ext: ImageFormat | null, { formatOpts }: ImagesOpts, effects: ParsedQs): Result<ConvertResult, Error> => {

    let code = 200, mime = ImageMimeType.ANY;

    const converter = sharp()

    const effectsResult = applyImageEffects(converter, effects)

    if (effectsResult.err)
        return effectsResult;

    if (width !== null || height != null) {

        code = 201;
        console.log(`Resizing file ${from} to ${width || 0}x${height || 0}`);

        converter.resize(width, height)
    }

    const candidateExtension = getAllowedExtension(
        pruneExtension(
            extname(from)
        ),
        "*" /** Force all known extensions here, in case the configuration changed over time */
    );

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

        /** Only meaningful when 201 code, when resize and no conversion */

        mime = getFormatMimeType(candidateExtension.val);
    }

    return Ok({ sharp: converter, code, mime });
}