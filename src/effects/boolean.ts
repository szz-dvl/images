import { BoolEnum, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { ImagesOpts } from "../types";
import { join } from "node:path";

export const applyBooleanEffect = (
  sharp: Sharp,
  booleanEffects: EffectOperation,
  { dir }: ImagesOpts
): Result<number, Error> => {
  const { opts } = getOperationDefinition(booleanEffects);

  sharp.boolean(join(dir, opts.operand as string), opts.operator as keyof BoolEnum);

  return Ok(201);
};
