import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyMedianEffect = (sharp: Sharp, medianEffects: EffectOperation): Result<number, Error> => {

    const { param: median } = getOperationDefinition(medianEffects)

    sharp.median(Number(median));

    return Ok(201);
}