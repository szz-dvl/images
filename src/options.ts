
import { EffectOperation, getOperationDefinition } from "./effects";
import { Err, Ok, Result } from "ts-results";
import { ParsedQs } from "qs";
import { CachePathState } from "./utils";
import { Create, CreateText, SharpOptions } from "sharp";

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

export const getResizeOptions = (effects: ParsedQs, cachePath: CachePathState): Record<string, number | string | boolean> => {

    const resizeKeys = Object.keys(effects).filter(k => k.startsWith("resize"));
    const batch: EffectOperation = {}

    for (const key of resizeKeys) {
        batch[key] = effects[key];
    }

    cachePath(batch)

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

export const getSharpOptions = (effects: ParsedQs, cachePath: CachePathState): SharpOptions => {

    const options: SharpOptions = {
        failOn: "warning",
        pages: -1, /** Consider all the pages for multi-page images */
        limitInputPixels: 268402689,
        unlimited: false,
        sequentialRead: true,
        density: 72,
        ignoreIcc: false,
        page: 0,
        subifd: -1,
        level: 0,
        animated: true, /** Same as above */
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

