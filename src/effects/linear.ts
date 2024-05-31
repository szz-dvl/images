import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyLinearEffect = (sharp: Sharp, linearEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(linearEffects);
    const typed: Record<string, number | Array<number>> = {}

    for (const opt in opts) {
        if (Array.isArray(opts[opt])) {
            typed[opt] = (<Array<string>>opts[opt]).map(val => Number(val))
            continue;
        }

        typed[opt] = Number(opts[opt])
    }

    sharp.linear(typed.a, typed.b)

    return Ok(201);
}
