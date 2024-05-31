import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyGammaEffect = (
  sharp: Sharp,
  gammaEffects: EffectOperation,
): Result<number, Error> => {
  const { param: gamma } = getOperationDefinition(gammaEffects);

  if (Array.isArray(gamma)) {
    sharp.gamma(...gamma.map((g) => Number(g)));
    return Ok(201);
  }

  sharp.gamma(Number(gamma));

  return Ok(201);
};
