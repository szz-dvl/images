import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyNormaliseEffect = (sharp: Sharp, normaliseEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(normaliseEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.normalise(opts);

    return Ok(201);
}