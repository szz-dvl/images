import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { isTruthyValue } from "../utils";

export const applyFlipEffect = (
  sharp: Sharp,
  flipEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(flipEffects);

  if (isTruthyValue(param)) {
    sharp.flop();
    return Ok(201);
  }
  return Ok(200);
};
