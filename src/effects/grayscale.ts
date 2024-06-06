import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const applyGrayscaleEffect = (
  sharp: Sharp,
  grayscaleEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(grayscaleEffects);

  if (param !== "false") {
    sharp.grayscale();
    return Ok(201);
  }

  return Ok(200);
};
