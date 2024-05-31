import { Kernel, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyConvolveEffect = (sharp: Sharp, convolveEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(convolveEffects);
    const typed: Record<string, number | Array<number>> = {}

    for (const opt in opts) {
        if (Array.isArray(opts[opt])) {
            typed[opt] = (<Array<string>>opts[opt]).map(kernel => Number(kernel))
            continue;
        }

        typed[opt] = Number(opts[opt])
    }

    sharp.convolve(typed as unknown as Kernel)

    return Ok(201);
}