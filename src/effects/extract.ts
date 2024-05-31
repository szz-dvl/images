import { Region, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyExtractEffect = (
  sharp: Sharp,
  extractEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(extractEffects);

  for (const opt in opts) {
    opts[opt] = Number(opts[opt]);
  }

  sharp.extract(opts as unknown as Region);

  return Ok(201);
};
