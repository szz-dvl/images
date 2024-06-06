import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyMedianEffect = (
  sharp: Sharp,
  medianEffects: EffectOperation,
): Result<number, Error> => {
  const { param: median } = getOperationDefinition(medianEffects);

  const num = Number(median);

  if (isNaN(num)) {
    sharp.median();
  }

  sharp.median(num);

  return Ok(201);
};
