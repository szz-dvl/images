import { EffectOperation, getOperationDefinition } from "./effects";
import { Err, Ok, Result } from "ts-results";
import { ParsedQs } from "qs";
import { CachePathState } from "./utils";
import { Create, CreateText, SharpOptions } from "sharp";
import { ImagesOpts } from "./types";

export const getTextOptions = (
  effects: ParsedQs,
  cachePath: CachePathState,
): Result<Record<string, number | string | boolean>, Error> => {
  const textKeys = Object.keys(effects).filter((k) => k.startsWith("text."));

  if (textKeys.length === 0) {
    return Err(new Error("No text options", { cause: effects }));
  }

  const batch: EffectOperation = {};

  for (const key of textKeys) {
    batch[key] = effects[key];
  }

  cachePath(batch);

  const { opts } = getOperationDefinition(batch);
  const typed: Record<string, number | string | boolean> = {};

  for (const opt in opts) {
    switch (opt) {
      case "width":
      case "height":
      case "dpi":
      case "spacing":
        typed[opt] = Number(opts[opt]);
        break;
      case "text":
      case "font":
      case "fontfile":
      case "align":
      case "wrap":
        typed[opt] = opts[opt] as string;
        break;
      case "justify":
      case "rgba":
        typed[opt] = opts[opt] !== "false";
        break;
      default:
        continue;
    }
  }

  return Ok(typed);
};

export const getCreateOptions = (
  effects: ParsedQs,
  cachePath: CachePathState,
): Result<Record<string, number | string | boolean>, Error> => {
  const createKeys = Object.keys(effects).filter((k) =>
    k.startsWith("create."),
  );

  if (createKeys.length === 0) {
    return Err(new Error("No create options", { cause: effects }));
  }

  const batch: EffectOperation = {};

  for (const key of createKeys) {
    batch[key] = effects[key];
  }

  cachePath(batch);

  const { opts } = getOperationDefinition(batch);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const typed: Record<string, any> = {};

  for (const opt in opts) {
    if (opt.includes("noise")) {
      if (!typed.noise) typed.noise = {};

      const noiseKey = opt.split(".").pop();

      switch (noiseKey) {
        case "type":
          typed.noise[noiseKey] = opts[opt] as string;
          break;
        case "mean":
        case "sigma":
          typed.noise[noiseKey] = Number(opts[opt]);
          break;
        default:
          continue;
      }
    }

    switch (opt) {
      case "width":
      case "height":
      case "channels":
        typed[opt] = Number(opts[opt]);
        break;
      case "background":
        typed[opt] = opts[opt] as string;
        break;
      default:
        continue;
    }
  }

  return Ok(typed);
};

export const getCompositeOptions = (
  effects: ParsedQs,
  cachePath: CachePathState,
): Result<EffectOperation, Error> => {
  const compositeKeys = Object.keys(effects).filter((k) =>
    k.startsWith("composite."),
  );

  if (compositeKeys.length === 0) {
    return Err(new Error("No composite options", { cause: effects }));
  }

  const batch: EffectOperation = {};

  for (const key of compositeKeys) {
    batch[key] = effects[key];
  }

  cachePath(batch);

  return Ok(batch);
};

export const getResizeOptions = (
  effects: ParsedQs,
  cachePath: CachePathState,
): Record<string, number | string | boolean> => {
  const resizeKeys = Object.keys(effects).filter((k) =>
    k.startsWith("resize."),
  );
  const batch: EffectOperation = {};

  for (const key of resizeKeys) {
    batch[key] = effects[key];
  }

  cachePath(batch);

  const { opts } = getOperationDefinition(batch);
  const typed: Record<string, number | string | boolean> = {};

  for (const opt in opts) {
    switch (opt) {
      case "width":
      case "height":
        typed[opt] = Number(opts[opt]);
        break;
      case "fit":
      case "position":
      case "background":
      case "kernel":
        typed[opt] = opts[opt] as string;
        break;
      case "withoutEnlargement":
      case "withoutReduction":
      case "fastShrinkOnLoad":
        typed[opt] = opts[opt] !== "false";
        break;
      default:
        continue;
    }
  }

  return typed;
};

export const getExtractAfterOptions = (
  prefix: string,
  effects: ParsedQs,
  cachePath: CachePathState,
): Result<EffectOperation, void> => {
  const extractAfterKeys = Object.keys(effects).filter((k) =>
    k.startsWith(prefix + "extractAfter."),
  );

  if (extractAfterKeys.length === 0) {
    return Err.EMPTY;
  }

  const batch: EffectOperation = {};

  for (const key of extractAfterKeys) {
    batch[key] = effects[key];
  }

  cachePath(batch);

  return Ok(batch);
};

export const getSharpOptions = (
  effects: ParsedQs,
  cachePath: CachePathState,
  { sharp }: ImagesOpts,
): SharpOptions => {
  const options: SharpOptions = { ...sharp };
  const textOptions = getTextOptions(effects, cachePath);
  const createOptions = getCreateOptions(effects, cachePath);

  if (textOptions.err && createOptions.err) return options;

  if (textOptions.ok) options.text = textOptions.val as unknown as CreateText;

  if (createOptions.ok) options.create = createOptions.val as unknown as Create;

  return options;
};
