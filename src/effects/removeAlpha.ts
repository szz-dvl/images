import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyRemoveAlphaEffect = (
  sharp: Sharp,
  removeAlphaEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(removeAlphaEffects);

  if (param !== "false") {
    sharp.removeAlpha();
    return Ok(201);
  }

  return Ok(200);
};
