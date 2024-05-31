import { BoolEnum, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyBandboolEffect = (
  sharp: Sharp,
  bandboolEffects: EffectOperation,
): Result<number, Error> => {
  const { param: op } = getOperationDefinition(bandboolEffects);

  sharp.bandbool(op as keyof BoolEnum);

  return Ok(201);
};
