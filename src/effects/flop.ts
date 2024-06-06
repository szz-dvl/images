import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { isTruthyValue } from "../utils";

export const applyFlopEffect = (
  sharp: Sharp,
  flopEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(flopEffects);

  if (isTruthyValue(param)) {
    sharp.flop();
    return Ok(201);
  }

  return Ok(200);
};
