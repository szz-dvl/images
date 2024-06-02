import { Region, Sharp } from "sharp";
import { EffectOperation, EffectOpts, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { forEach, mapValues } from "lodash";

export const applyExtractEffect = (
  sharp: Sharp,
  extractEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(extractEffects);

  sharp.extract(mapValues(opts, Number) as unknown as Region);

  return Ok(201);
};
