import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyNegateEffect = (sharp: Sharp, negateEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(negateEffects)

    for (const opt in opts) {
        opts[opt] = opts[opt] !== "false";
    }

    sharp.negate(opts);

    return Ok(201);
}
