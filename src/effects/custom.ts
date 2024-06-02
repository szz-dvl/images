import { Sharp } from "sharp";
import { EffectHandler, EffectOperation, getOperationDefinition } from ".";
import { Ok, Result } from "ts-results";
import { ImagesOpts } from "../types";
import { forEach, reduce } from "lodash";

export const applyCustomEffect = (
  sharp: Sharp,
  customEffect: EffectOperation,
  { customEffects }: ImagesOpts
): Result<number, Error> => {
  if (customEffects) {
    const { param: key, opts } = getOperationDefinition(customEffect);

    const customEffectFinder = (key: string) => {
      const effectHandler = customEffects[key];
      if (effectHandler) {
        return effectHandler(sharp, opts);
      }
      return Ok(200);
    };

    if (key) {
      if (typeof key === "string") {
        return customEffectFinder(key);
      }
      if (Array.isArray(key)) {
        return reduce<string, ReturnType<EffectHandler>>(
          key,
          (agg, key) => customEffectFinder(key),
          Ok(200)
        );
      }
    }
  }

  return Ok(200);
};
