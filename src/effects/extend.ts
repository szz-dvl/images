import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues, omitBy, identity } from "lodash";

export const applyExtendEffect = (
  sharp: Sharp,
  extendEffects: EffectOperation,
): Result<number, Error> => {
  const { param: extend, opts } = getOperationDefinition(extendEffects);

  if (extend) {
    sharp.extend(Number(extend));
    return Ok(201);
  }

  sharp.extend(
    omitBy(
      mapValues(opts, (opt, key) => {
        switch (key) {
          case "top":
          case "left":
          case "bottom":
          case "right":
            return Number(opt);
          case "extendWith":
          case "background":
            return opt.toString();
          default:
            return null;
        }
      }),
      identity,
    ),
  );

  return Ok(201);
};
