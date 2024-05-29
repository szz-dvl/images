import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyExtractChannelEffect = (sharp: Sharp, extractChannelEffects: EffectOperation): Result<number, Error> => {

    const { param: channel } = getOperationDefinition(extractChannelEffects);

    const typed = Number(channel);

    if (isNaN(typed)) {
        sharp.extractChannel(channel as 'red' | 'green' | 'blue' | 'alpha');    
        return Ok(201);
    }

    sharp.extractChannel(typed as 0 | 1 | 2 | 3);
    return Ok(201);
}