import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyTrimEffect = (sharp: Sharp, trimEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(trimEffects)

    for (const opt in opts) {
        switch (opt) {
            case "threshold":
                opts[opt] = Number(opts[opt])
            case "lineArt":
                opts[opt] !== "false"
            case "background":
                opts[opt] = opts[opt].toString()
        }
    }

    sharp.trim(opts);

    return Ok(201);
}