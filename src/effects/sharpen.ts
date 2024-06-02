import { Sharp, SharpenOptions } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";

export const applySharpenEffect = (
  sharp: Sharp,
  sharpenEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(sharpenEffects);

  sharp.sharpen(mapValues(opts, Number) as unknown as SharpenOptions);

  return Ok(201);
};
