import { Sharp } from "sharp";
import { EffectOperation } from "./";
import { Ok, Result } from "ts-results";

export const applyUnflattenEffect = (sharp: Sharp, _unflattenEffects: EffectOperation): Result<number, Error> => {

    sharp.unflatten();

    return Ok(201);
}