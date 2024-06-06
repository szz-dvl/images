import { ParsedQs } from "qs";
import { Sharp } from "sharp";
import {
  getCompositeOptions,
  getCreateOptions,
  getTextOptions,
} from "./options";
import { CachePathState, isTruthyValue } from "./utils";
import { EffectOperation, getOperationDefinition } from "./effects";
import { Ok, Result } from "ts-results";
import { join } from "node:path";

export const compositeImages = (
  sharp: Sharp,
  dir: string,
  effects: ParsedQs,
  cachePath: CachePathState,
): Result<void, Error> => {
  const compositeOptions = getCompositeOptions(effects, cachePath);
  if (compositeOptions.err) return compositeOptions;

  const { opts } = getOperationDefinition(compositeOptions.val);

  const sortedKeys = Object.keys(opts);
  sortedKeys.sort();

  const images = [];

  for (let i = 0; i < sortedKeys.length; ) {
    const currentKey = sortedKeys[i];
    const imageBatch: Record<string, unknown> = {};

    do {
      imageBatch[sortedKeys[i]] = opts[sortedKeys[i]];
      i++;
    } while (
      i < sortedKeys.length &&
      sortedKeys[i].startsWith(currentKey.split(".")[0])
    );

    images.push(imageBatch);
  }

  const typedImages = [];

  for (const image of images) {
    let typedImage: Record<
      string,
      number | string | boolean | Record<string, unknown>
    > = {};

    const textRawOptions: EffectOperation = {};
    const createRawOptions: EffectOperation = {};

    for (const imageKey in image) {
      const effectiveKey = imageKey.split(".").slice(1).join(".");

      if (!effectiveKey) {
        typedImage = {
          input: join(dir, image[imageKey] as string),
          animated: true,
          failsOn: "warning",
          limitInputPixels: 268402689,
        };
      } else {
        if (effectiveKey.startsWith("text.")) {
          textRawOptions[effectiveKey] = image[imageKey] as string;
          continue;
        }

        if (effectiveKey.startsWith("create.")) {
          createRawOptions[effectiveKey] = image[imageKey] as string;
          continue;
        }
      }

      switch (effectiveKey) {
        case "blend":
        case "gravity":
          typedImage[effectiveKey] = image[imageKey] as string;
          break;
        case "top":
        case "left":
        case "density":
          typedImage[effectiveKey] = Number(image[imageKey]);
          break;
        case "tile":
        case "premultiplied":
          typedImage[effectiveKey] = isTruthyValue(image[imageKey]);
          break;
        default:
          continue;
      }
    }

    const textOptions = getTextOptions(
      textRawOptions,
      (() => {}) as CachePathState,
    );
    if (textOptions.ok) typedImage.input = { text: textOptions.val };

    const createOptions = getCreateOptions(
      createRawOptions,
      (() => {}) as CachePathState,
    );
    if (createOptions.ok) typedImage.input = { create: createOptions.val };

    typedImages.push(typedImage);
  }

  if (typedImages.length) sharp.composite(typedImages);

  return Ok.EMPTY;
};
