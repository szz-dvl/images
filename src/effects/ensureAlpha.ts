import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyEnsureAlphaEffect = (
  sharp: Sharp,
  ensureAlphaEffects: EffectOperation,
): Result<number, Error> => {
  const { param: alpha } = getOperationDefinition(ensureAlphaEffects);

  sharp.ensureAlpha(Number(alpha));

  return Ok(201);
};
