import { Matrix3x3, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { filter, map } from "lodash";

export const applyRecombEffect = (
  sharp: Sharp,
  recombEffects: EffectOperation,
): Result<number, Error> => {
  /** Queries must look like: ?recomb.0=1&recomb.0=1 ... &recomb.2=2 */

  const { opts } = getOperationDefinition(recombEffects);
  const recombMatrix: Matrix3x3 = [] as unknown as Matrix3x3;

  for (const opt in opts) {
    const idx = Number(opt.split(".").pop());
    if (Array.isArray(opts[opt])) {
      recombMatrix[idx] = filter(
        map(<Array<string>>opts[opt], (val, idx) =>
          idx < 3 ? Number(val) : null,
        ),
        (elem) => elem !== 0 && elem,
      ) as [number, number, number];
    }
  }

  sharp.recomb(recombMatrix);

  return Ok(201);
};
