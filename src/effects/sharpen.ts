import { Sharp, SharpenOptions } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applySharpenEffect = (sharp: Sharp, sharpenEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(sharpenEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.sharpen(opts as unknown as SharpenOptions);

    return Ok(201);
}