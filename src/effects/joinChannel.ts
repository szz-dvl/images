import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { join } from "node:path";
import { ImagesOpts } from "../types";

export const applyJoinChannelEffect = (
  sharp: Sharp,
  joinChannelEffects: EffectOperation,
  { dir, sharp: sharpOptions }: ImagesOpts,
): Result<number, Error> => {
  const { param: images } = getOperationDefinition(joinChannelEffects);

  const local = [];

  if (Array.isArray(images)) {
    for (const path of images) {
      local.push(join(dir, path as string));
    }
  } else {
    local.push(join(dir, images as string));
  }

  sharp.joinChannel(local, sharpOptions);

  return Ok(201);
};
