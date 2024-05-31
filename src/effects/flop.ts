import { Sharp } from "sharp";
import { EffectOperation } from "./";
import { Ok, Result } from "ts-results";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const applyFlopEffect = (sharp: Sharp, _flopEffects: EffectOperation): Result<number, Error> => {

    sharp.flop();

    return Ok(201);
}
