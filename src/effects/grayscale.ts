import { Sharp } from "sharp";
import { EffectOperation } from "../effects";
import { Ok, Result } from "ts-results";

export const applyGrayscaleEffect = (sharp: Sharp, _grayscaleEffects: EffectOperation): Result<number, Error> => {

    sharp.grayscale();

    return Ok(201);
}