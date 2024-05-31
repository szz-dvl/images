import { Sharp } from "sharp";
import { EffectOperation } from "./";
import { Ok, Result } from "ts-results";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const applyGrayscaleEffect = (sharp: Sharp, _grayscaleEffects: EffectOperation): Result<number, Error> => {

    sharp.grayscale();

    return Ok(201);
}