import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { mapValues } from "lodash";
import { isTruthyValue } from "../utils";

export const applyTrimEffect = (
  sharp: Sharp,
  trimEffects: EffectOperation,
): Result<number, Error> => {
  const { opts } = getOperationDefinition(trimEffects);

  sharp.trim(
    mapValues(opts, (opt, key) => {
      switch (key) {
        case "threshold":
          return Number(opt);
        case "lineArt":
          return isTruthyValue(opt);
        case "background":
          return opt as string;
        default:
          return opt;
      }
    }),
  );

  return Ok(201);
};
