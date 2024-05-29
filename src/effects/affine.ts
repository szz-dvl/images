import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyAffineEffect = (sharp: Sharp, affineEffects: EffectOperation): Result<number, Error> => {

    const { param, opts } = getOperationDefinition(affineEffects)

    const affineMatrix = (<Array<string>>param).map((elem, idx) => idx < 4 ? Number(elem) : null).filter(elem => elem != 0 && elem)

    sharp.affine(affineMatrix as [number, number, number, number], opts);

    return Ok(201);
}
