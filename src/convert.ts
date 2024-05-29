import { ImageSize, ImagesOpts } from "./types";
import { ImageFormat, ImageMimeType } from "./constants";
import sharp, { Sharp } from "sharp";
import { Err, Ok, Result } from "ts-results";
import { getAllowedExtension, getFormatMimeType, pruneExtension } from "./utils";
import { extname } from "path";
import { EffectOperation, applyImageEffects, getOperationDefinition } from "./effects";
import { ParsedQs } from "qs";

export type ConvertResult = {
    sharp: Sharp,
    code: number,
    mime: ImageMimeType
}

const getResizeOptions = (effects: ParsedQs): Record<string, number | string | boolean> => {

    const resizeKeys = Object.keys(effects).filter(k => k.startsWith("resize"));
    const batch: EffectOperation = {}

    for (const key of resizeKeys) {
        batch[key] = effects[key];
    }

    const { opts } = getOperationDefinition(batch)
    const typed: Record<string, number | string | boolean> = {}

    for (const opt in opts) {
        switch (opt) {
            case "width":
            case "height":
                typed[opt] = Number(opts[opt])
                break;
            case "fit":
            case "position":
            case "background":
            case "kernel":
                typed[opt] = opts[opt].toString()
                break;
            case "withoutEnlargement":
            case "withoutReduction":
            case "fastShrinkOnLoad":
                typed[opt] = opts[opt] !== "false"
                break;
            default:
                continue;
        }
    }

    return typed;
}

export const convertFile = (from: string, [width, height]: ImageSize, ext: ImageFormat | null, { formatOpts, allowedEffects }: ImagesOpts, effects: ParsedQs): Result<ConvertResult, Error> => {

    let code = 200, mime = ImageMimeType.ANY;

    const converter = sharp();

    const effectsResult = applyImageEffects(converter, effects, allowedEffects);

    if (effectsResult.err)
        return effectsResult;

    if (width !== null || height != null) {

        code = 201;
        console.log(`Resizing file ${from} to ${width || 0}x${height || 0}`);

        const opts = getResizeOptions(effects);
        converter.resize(width, height, opts);

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