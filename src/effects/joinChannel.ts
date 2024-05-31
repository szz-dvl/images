import { Sharp } from "sharp";
import { EffectOperation, getOperationDefinition } from "./";
import { Ok, Result } from "ts-results";
import { checkFile } from "../fs";
import { join } from "node:path";

export const applyJoinChannelEffect = async (sharp: Sharp, joinChannelEffects: EffectOperation, dir: string): Promise<Result<number, Error>> => {

    const { param: images } = getOperationDefinition(joinChannelEffects)

    const exists = [];

    if (Array.isArray(images)) {

        for (const path of images) {
            const result = await checkFile(join(dir, path), false);
            if (result.ok) {
                exists.push(result.val);
            }
        }
        
    } else {

        const result = await checkFile(join(dir, images as string), false);
        if (result.ok) {
            exists.push(result.val);
        }
    }


    sharp.joinChannel(exists);

    return Ok(201);
}