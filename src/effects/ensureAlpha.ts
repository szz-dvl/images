import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyEnsureAlphaEffect = (
  sharp: Sharp,
  ensureAlphaEffects: EffectOperation,
): Result<number, Error> => {
  const { param: alpha } = getOperationDefinition(ensureAlphaEffects);

  const num = Number(alpha);

  if (isNaN(num)) {
    sharp.ensureAlpha();
  }

  sharp.ensureAlpha(num);

  return Ok(201);
};
