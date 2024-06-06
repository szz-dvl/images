import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyFlipEffect = (
  sharp: Sharp,
  flipEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(flipEffects);

  if (param !== "false") {
    sharp.flop();
    return Ok(201);
  }
  return Ok(200);
};
