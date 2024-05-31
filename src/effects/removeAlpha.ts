import { Sharp } from "sharp";
import { EffectOperation } from "./";
import { Ok, Result } from "ts-results";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const applyRemoveAlphaEffect = (sharp: Sharp, _removeAlphaEffects: EffectOperation): Result<number, Error> => {

    sharp.removeAlpha();

    return Ok(201);
}
