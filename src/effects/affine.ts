import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Err, Ok, Result } from "ts-results";
import { compact, filter, map } from "lodash";

export const applyAffineEffect = (
  sharp: Sharp,
  affineEffects: EffectOperation
): Result<number, Error> => {
  const { param, opts } = getOperationDefinition(affineEffects);

  if (Array.isArray(param)) {
    const affineMatrix = filter(
      map<string, number | null>(param, (elem, idx) => {
        return idx < 4 ? Number(elem) : null;
      }),
      (elem) => elem !== 0 && elem
    );

    sharp.affine(affineMatrix as [number, number, number, number], opts);

    return Ok(201);
  }

  return Ok(200);
};
