import { ClaheOptions, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyClaheEffect = (sharp: Sharp, claheEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(claheEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.clahe(opts as unknown as ClaheOptions);

    return Ok(201);
}