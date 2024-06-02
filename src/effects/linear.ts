import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { map, mapValues } from "lodash";

export const applyLinearEffect = (
  sharp: Sharp,
  linearEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(linearEffects);

  const typed = mapValues(opts, (opt) => {
    if (Array.isArray(opt)) {
      return map(opt, Number);
    }

    return Number(opt);
  });

  sharp.linear(typed.a, typed.b);

  return Ok(201);
};
