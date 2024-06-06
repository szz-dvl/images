import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";
import { isTruthyValue } from "../utils";

export const applyNormaliseEffect = (
  sharp: Sharp,
  normaliseEffects: EffectOperation,
): Result<number, Error> => {
  const { param, opts } = getOperationDefinition(normaliseEffects);

  if (isTruthyValue(param)) {
    sharp.normalise(mapValues(opts, Number));
    return Ok(201);  
  }
  return Ok(200);
};
