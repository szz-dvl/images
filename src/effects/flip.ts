import { Sharp } from "sharp";
import { EffectOperation } from "../effects";
import { Ok, Result } from "ts-results";

export const applyFlipEffect = (sharp: Sharp, _flipEffects: EffectOperation): Result<number, Error> => {
    
    sharp.flip();

    return Ok(201);
}