import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";

export const applyNormaliseEffect = (
  sharp: Sharp,
  normaliseEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(normaliseEffects);

  sharp.normalise(mapValues(opts, Number));

  return Ok(201);
};
