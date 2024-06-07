import { Sharp, SharpenOptions } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";
import { isTruthyValue } from "../utils";

export const applySharpenEffect = (
  sharp: Sharp,
  sharpenEffects: EffectOperation,
): Result<number, Error> => {
  const { param, opts } = getOperationDefinition(sharpenEffects);

  if (isTruthyValue(param)) {
    const keys = Object.keys(opts);

    if (keys.length === 0) {
      sharp.sharpen();
      return Ok(201);
    }

    sharp.sharpen(mapValues(opts, Number) as unknown as SharpenOptions);
    return Ok(201);
  }

  return Ok(200);
};
