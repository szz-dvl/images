import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";
import { isTruthyValue } from "../utils";

export const applyNegateEffect = (
  sharp: Sharp,
  negateEffects: EffectOperation,
): Result<number, Error> => {
  const { param, opts } = getOperationDefinition(negateEffects);

  if (isTruthyValue(param)) {
    sharp.negate(mapValues(opts, isTruthyValue));
    return Ok(201);
  }

  return Ok(200);
};
