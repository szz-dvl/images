import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";

export const applyModulateEffect = (
  sharp: Sharp,
  modulateEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(modulateEffects);

  sharp.modulate(mapValues(opts, Number));

  return Ok(201);
};
