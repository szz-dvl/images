import { BoolEnum, Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";

export const applyBooleanEffect = (sharp: Sharp, booleanEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(booleanEffects)

    sharp.boolean(opts.operand as string, opts.operator as keyof BoolEnum);

    return Ok(201);
}