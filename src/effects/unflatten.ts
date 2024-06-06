import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { isTruthyValue } from "../utils";

export const applyUnflattenEffect = (
  sharp: Sharp,
  unflattenEffects: EffectOperation,
): Result<number, Error> => {
  const { param } = getOperationDefinition(unflattenEffects);

  if (isTruthyValue(param)) {
    sharp.unflatten();
    return Ok(201);
  }

  return Ok(200);
};
