import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyThresholdEffect = (
  sharp: Sharp,
  thresholdEffects: EffectOperation,
): Result<number, Error> => {
  const { param: threshold, opts } = getOperationDefinition(thresholdEffects);

  for (const opt in opts) {
    opts[opt] = opts[opt] !== "false";
  }

  sharp.threshold(Number(threshold), opts);

  return Ok(201);
};
