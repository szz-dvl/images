import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyModulateEffect = (sharp: Sharp, modulateEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(modulateEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.modulate(opts);

    return Ok(201);
}