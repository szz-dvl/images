import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyToColorspaceEffect = (
  sharp: Sharp,
  toColorspaceEffects: EffectOperation,
): Result<number, Error> => {
  const { param: toColorspace } = getOperationDefinition(toColorspaceEffects);

  sharp.pipelineColorspace(toColorspace as string);

  return Ok(201);
};
