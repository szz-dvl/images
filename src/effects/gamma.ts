import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { map } from "lodash";

export const applyGammaEffect = (
  sharp: Sharp,
  gammaEffects: EffectOperation,
): Result<number, Error> => {
  const { param: gamma } = getOperationDefinition(gammaEffects);

  if (Array.isArray(gamma)) {
    sharp.gamma(...map(gamma, Number));
    return Ok(201);
  }

  sharp.gamma(Number(gamma));

  return Ok(201);
};
