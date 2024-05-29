import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyFlopEffect = (sharp: Sharp, _flopEffects: EffectOperation): Result<number, Error> => {

    sharp.flop();

    return Ok(201);
}
