import { Sharp } from "sharp";
import { EffectOperation } from "../effects";
import { Ok, Result } from "ts-results";

export const applyRemoveAlphaEffect = (sharp: Sharp, _removeAlphaEffects: EffectOperation): Result<number, Error> => {

    sharp.removeAlpha();

    return Ok(201);
}
