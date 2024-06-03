import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from ".";
import { Ok, Result } from "ts-results";
import { ImagesOpts } from "../types";
import { reduce } from "lodash";

export const applyCustomEffect = (
  sharp: Sharp,
  customEffect: EffectOperation,
  { customEffects }: ImagesOpts,
): Result<number, Error> => {
  if (customEffects) {
    const { param: key, opts } = getOperationDefinition(customEffect);

    const customEffectFinder = (key: string) => {
      const effectHandler = customEffects[key];
      if (effectHandler) {
        effectHandler(sharp, opts);
        return Ok(201);
      }
      return Ok(200);
    };

    if (key) {
      if (typeof key === "string") {
        return customEffectFinder(key);
      }
      if (Array.isArray(key)) {
        return reduce<string, Ok<number>>(
          key,
          (agg, key) => customEffectFinder(key),
          Ok(200),
        );
      }
    }
  }

  return Ok(200);
};
