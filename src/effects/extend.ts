import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyExtendEffect = (
  sharp: Sharp,
  extendEffects: EffectOperation,
): Result<number, Error> => {
  const { param: extend, opts } = getOperationDefinition(extendEffects);

  if (extend) {
    sharp.extend(Number(extend));
    return Ok(201);
  }

  for (const opt in opts) {
    switch (opt) {
      case "top":
      case "left":
      case "bottom":
      case "right":
        opts[opt] = Number(opts[opt]);
        break;
      case "extendWith":
      case "background":
        opts[opt] = opts[opt].toString();
        break;
      default:
        continue;
    }
  }

  sharp.extend(opts);

  return Ok(201);
};
