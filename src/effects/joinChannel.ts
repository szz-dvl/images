import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "../effects";
import { Ok, Result } from "ts-results";

export const applyJoinChannelEffect = (sharp: Sharp, joinChannelEffects: EffectOperation): Result<number, Error> => {

    const { param: images } = getOperationDefinition(joinChannelEffects)

    sharp.joinChannel(images as Array<string>);

    return Ok(201);
}