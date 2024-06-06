import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const applyUnflattenEffect = (
  sharp: Sharp,
  unflattenEffects: EffectOperation
): Result<number, Error> => {
  const { param } = getOperationDefinition(unflattenEffects);

  if (param !== "false") {
    sharp.unflatten();
    return Ok(201);
  }

  return Ok(200);
};
