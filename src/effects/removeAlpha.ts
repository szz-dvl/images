import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { isTruthyValue } from "../utils";

export const applyRemoveAlphaEffect = (
  sharp: Sharp,
  removeAlphaEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(removeAlphaEffects);

  if (isTruthyValue(param)) {
    sharp.removeAlpha();
    return Ok(201);
  }

  return Ok(200);
};
