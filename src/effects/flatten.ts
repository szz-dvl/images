import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { isTruthyValue } from "../utils";

export const applyFlattenEffect = (
  sharp: Sharp,
  flattenEffects: EffectOperation,
): Result<number, Error> => {
  const { param, opts } = getOperationDefinition(flattenEffects);

  if (isTruthyValue(param)) {
    sharp.flatten(opts);
    return Ok(201);
  }

  return Ok(200);
};
