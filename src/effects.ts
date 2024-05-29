import { Sharp } from "sharp";
import { Ok, Result } from "ts-results";
import { ParsedQs } from "qs";

type EffectOperation = Record<string, undefined | string | string[] | ParsedQs | ParsedQs[]>

const applyRotationEffect = (sharp: Sharp, rotationEffects: EffectOperation): Result<void, Error> => {

    let rotation = 0;
    const opts: Record<string, string> = {};

    for (const rotationEffect in rotationEffects) {
        if (rotationEffect.includes(".")) {
            const optKey = rotationEffect.split(".").pop()!
            opts[optKey] = rotationEffects[rotationEffect]!.toString()
            continue;
        }

        rotation = Number(rotationEffects[rotationEffect])
    }

    sharp.rotate(rotation, opts);

    return Ok.EMPTY;
}

export const applyImageEffects = (sharp: Sharp, effects: ParsedQs): Result<void, Error> => {

    const effectsKeys = Object.keys(effects)

    for (let i = 0; i < effectsKeys.length;) {

        let effect = effectsKeys[i];
        const batch: EffectOperation = {}
        const effectKey = effect.split(".")[0]!

        do {

            batch[effect] = effects[effect];
            effect = effectsKeys[++i];

        } while (effect && effect.startsWith(effectKey));

        let result: Result<void, Error> = Ok.EMPTY;

        switch (effectKey) {
            case "rotate": {
                result = applyRotationEffect(sharp, batch);
            }
                break;
            default:
                console.log(`Ignoring unrecognized effect: ${effectKey}`);
        }

        if (result.err)
            return result;

    }

    return Ok.EMPTY;

}