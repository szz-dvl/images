import { ClaheOptions, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";

export const applyClaheEffect = (
  sharp: Sharp,
  claheEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(claheEffects);

  sharp.clahe(mapValues(opts, Number) as unknown as ClaheOptions);

  return Ok(201);
};
