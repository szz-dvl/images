import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyFlattenEffect = (sharp: Sharp, flattenEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(flattenEffects)

    sharp.flatten(opts);

    return Ok(201);
}