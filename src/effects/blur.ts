import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyBlurEffect = (sharp: Sharp, medianEffects: EffectOperation): Result<number, Error> => {

    const { param: sigma } = getOperationDefinition(medianEffects)

    sharp.blur(Number(sigma));

    return Ok(201);
}