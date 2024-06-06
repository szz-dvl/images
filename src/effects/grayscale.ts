import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { isTruthyValue } from "../utils";

export const applyGrayscaleEffect = (
  sharp: Sharp,
  grayscaleEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(grayscaleEffects);

  if (isTruthyValue(param)) {
    sharp.grayscale();
    return Ok(201);
  }

  return Ok(200);
};
