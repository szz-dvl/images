import { ImageSize, ImagesOpts } from "./types";
import { ImageEffect, ImageFormat, ImageMimeType } from "./constants";
import sharp, { Create, CreateText, Sharp, SharpOptions } from "sharp";
import { Err, Ok, Result } from "ts-results";
import { CachePathState, getAllowedExtension, getFormatMimeType, pruneExtension } from "./utils";
import { extname } from "path";
import { EffectOperation, applyImageEffects, getOperationDefinition } from "./effects";
import { ParsedQs } from "qs";

type ConvertResult = {
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
                typed[opt] = opts[opt] as string
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

const getTextOptions = (effects: ParsedQs, cachePath: CachePathState): Result<Record<string, number | string | boolean>, Error> => {

    const textKeys = Object.keys(effects).filter(k => k.startsWith("text"));

    if (textKeys.length === 0) {
        return Err(new Error("No text options", { cause: effects }));
    }

    const batch: EffectOperation = {}

    for (const key of textKeys) {
        batch[key] = effects[key];
    }

    cachePath(batch);

    const { opts } = getOperationDefinition(batch)
    const typed: Record<string, number | string | boolean> = {}

    for (const opt in opts) {
        switch (opt) {
            case "width":
            case "height":
            case "dpi":
            case "spacing":
                typed[opt] = Number(opts[opt])
                break;
            case "text":
            case "font":
            case "fontfile":
            case "align":
            case "wrap":
                typed[opt] = opts[opt] as string
                break;
            case "justify":
            case "rgba":
                typed[opt] = opts[opt] !== "false"
                break;
            default:
                continue;
        }
    }

    return Ok(typed);
}

const getCreateOptions = (effects: ParsedQs, cachePath: CachePathState): Result<Record<string, number | string | boolean>, Error> => {

    const createKeys = Object.keys(effects).filter(k => k.startsWith("create"));

    if (createKeys.length === 0) {
        return Err(new Error("No create options", { cause: effects }));
    }

    const batch: EffectOperation = {}

    for (const key of createKeys) {
        batch[key] = effects[key];
    }

    cachePath(batch);

    const { opts } = getOperationDefinition(batch);
    const typed: Record<string, any> = {
        noise: {}
    }

    for (const opt in opts) {

        if (opt.includes("noise")) {
            const noiseKey = opt.split(".").pop();

            switch (noiseKey) {
                case "type":
                    typed.noise[noiseKey] = opts[opt] as string
                case "mean":
                case "sigma":
                    typed[opt] = Number(opts[opt])
                    break;
            }
        }

        switch (opt) {
            case "width":
            case "height":
            case "channels":
                typed[opt] = Number(opts[opt])
                break;
            case "background":
                typed[opt] = opts[opt] as string
                break;
            default:
                continue;
        }
    }

    return Ok(typed);
}

export const getSharpOptions = (effects: ParsedQs, cachePath: CachePathState): SharpOptions => {

    const options: SharpOptions = {
        pages: -1 /** Consider all the pages for multi-page images */
    }

    const textOptions = getTextOptions(effects, cachePath);
    const createOptions = getCreateOptions(effects, cachePath);

    if (textOptions.err && createOptions.err)
        return options;

    if (textOptions.ok)
        options.text = textOptions.val as unknown as CreateText;

    if (createOptions.ok)
        options.create = createOptions.val as unknown as Create;

    return options;
}
export const convertFile = (from: string | void, options: SharpOptions, [width, height]: ImageSize, ext: ImageFormat | null, { formatOpts, allowedEffects }: ImagesOpts, effects: ParsedQs, cachePath: CachePathState): Result<ConvertResult, Error> => {

    try {
        let code = 200, mime = ImageMimeType.ANY;

        const converter = sharp(options).keepMetadata();

        const effectsResult = applyImageEffects(converter, effects, allowedEffects, cachePath);

        if (effectsResult.err)
            return effectsResult;

        code = effectsResult.val;

        if (width !== null || height != null) {

            code = 201;
            console.log(`Resizing file ${from} to ${width || 0}x${height || 0}`);

            const opts = getResizeOptions(effects);
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

            /** Only meaningful when 201 code, when resize and no conversion */

            mime = getFormatMimeType(candidateExtension.val);
        }

        return Ok({ sharp: converter, code, mime });

    } catch (err) {
        return Err(err as Error)
    }
}