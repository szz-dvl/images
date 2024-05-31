import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyPipelineColorspaceEffect = (
  sharp: Sharp,
  pipelineColorspaceEffects: EffectOperation,
): Result<number, Error> => {
  const { param: pipelineColorspace } = getOperationDefinition(
    pipelineColorspaceEffects,
  );

  sharp.pipelineColorspace(pipelineColorspace as string);

  return Ok(201);
};
