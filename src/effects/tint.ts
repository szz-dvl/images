import { Color, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyTintEffect = (sharp: Sharp, tintEffects: EffectOperation): Result<number, Error> => {

    const { param: tint } = getOperationDefinition(tintEffects)

    sharp.tint(tint as Color);

    return Ok(201);
}