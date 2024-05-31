import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyTrimEffect = (
  sharp: Sharp,
  trimEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(trimEffects);

  for (const opt in opts) {
    switch (opt) {
      case "threshold":
        opts[opt] = Number(opts[opt]);
        break;
      case "lineArt":
        opts[opt] !== "false";
        break;
      case "background":
        opts[opt] = opts[opt].toString();
        break;
    }
  }

  sharp.trim(opts);

  return Ok(201);
};
