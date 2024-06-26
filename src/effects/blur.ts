import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyBlurEffect = (
  sharp: Sharp,
  blurEffects: EffectOperation,
): Result<number, Error> => {
  const { param: sigma } = getOperationDefinition(blurEffects);

  const num = Number(sigma);

  if (!isNaN(num) && num === 0) {
    sharp.blur();
    return Ok(201);
  }

  sharp.blur(num);
  return Ok(201);
};
