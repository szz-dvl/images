import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";

export const applyThresholdEffect = (
  sharp: Sharp,
  thresholdEffects: EffectOperation,
): Result<number, Error> => {
  const { param: threshold, opts } = getOperationDefinition(thresholdEffects);

  sharp.threshold(
    Number(threshold),
    mapValues(opts, (val) => {
      return val !== "false";
    }),
  );

  return Ok(201);
};
