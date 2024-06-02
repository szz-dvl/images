import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";

export const applyNegateEffect = (
  sharp: Sharp,
  negateEffects: EffectOperation
): Result<number, Error> => {
  const { opts } = getOperationDefinition(negateEffects);

  sharp.negate(mapValues(opts, (val) => {
    return val !== "false";
  }));

  return Ok(201);
};
