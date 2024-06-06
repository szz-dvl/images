import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const applyFlopEffect = (
  sharp: Sharp,
  flopEffects: EffectOperation,
): Result<number, Error> => {

  const { param } = getOperationDefinition(flopEffects);

  if (param !== "false") {
    sharp.flop();
    return Ok(201);
  }

  return Ok(200);
};

