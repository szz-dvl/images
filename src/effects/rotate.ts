import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyRotationEffect = (sharp: Sharp, rotationEffects: EffectOperation): Result<number, Error> => {

    const { param: rotation, opts } = getOperationDefinition(rotationEffects)

    sharp.rotate(Number(rotation), opts);

    return Ok(201);
}