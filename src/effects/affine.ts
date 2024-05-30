import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Err, Ok, Result } from "ts-results";

export const applyAffineEffect = (sharp: Sharp, affineEffects: EffectOperation): Result<number, Error> => {

    const { param, opts } = getOperationDefinition(affineEffects)

    if (Array.isArray(param)) {
        const affineMatrix = (<Array<string>>param).map((elem, idx) => idx < 4 ? Number(elem) : null).filter(elem => elem != 0 && elem)

        sharp.affine(affineMatrix as [number, number, number, number], opts);

        return Ok(201);
    }

    return Err(new Error("Invalid params received", { cause: param }));
}
