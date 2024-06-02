import { Kernel, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { identity, map, mapValues, omitBy } from "lodash";

export const applyConvolveEffect = (
  sharp: Sharp,
  convolveEffects: EffectOperation
): Result<number, Error> => {
  const { opts } = getOperationDefinition(convolveEffects);

  sharp.convolve(
    mapValues(opts, (opt) => {
      if (Array.isArray(opt)) {
        return map(opt, (kernel) => Number(kernel));
      }

      return Number(opt);
    }) as unknown as Kernel
  );

  return Ok(201);
};
