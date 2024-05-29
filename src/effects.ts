import { BoolEnum, ClaheOptions, Kernel, Matrix3x3, Region, Sharp, SharpenOptions } from "sharp";
import { Ok, Result } from "ts-results";
import { ParsedQs } from "qs";
import { ImageEffect } from "./constants";
import { cloneDeep } from "lodash";
import { applyAffineEffect } from "./effects/affine";
import { applyBlurEffect } from "./effects/blur";
import { applyBooleanEffect } from "./effects/boolean";
import { applyClaheEffect } from "./effects/clahe";
import { applyConvolveEffect } from "./effects/convolve";
import { applyExtendEffect } from "./effects/extend";
import { applyExtractEffect } from "./effects/extract";
import { applyFlattenEffect } from "./effects/flatten";
import { applyFlipEffect } from "./effects/flip";
import { applyFlopEffect } from "./effects/flop";
import { applyGammaEffect } from "./effects/gamma";
import { applyLinearEffect } from "./effects/linear";
import { applyMedianEffect } from "./effects/median";
import { applyModulateEffect } from "./effects/modulate";
import { applyNegateEffect } from "./effects/negate";
import { applyNormaliseEffect } from "./effects/normalise";
import { applyRecombEffect } from "./effects/recomb";
import { applyRotationEffect } from "./effects/rotate";
import { applySharpenEffect } from "./effects/sharpen";
import { applyThresholdEffect } from "./effects/threshold";
import { applyTrimEffect } from "./effects/trim";
import { applyUnflattenEffect } from "./effects/unflatten";

export type EffectOperation = Record<string, undefined | string | string[] | ParsedQs | ParsedQs[]>
type EffectState = Record<ImageEffect, number>

type EffectsState = {
    state: EffectState;
    code: number;
}

const initEffectsState = (state: EffectState) => {

    let code = 200;

    return (effect?: ImageEffect): boolean | EffectsState => {
        if (effect) {
            state[effect] -= 1

            if (state[effect] >= 0)
                code = 201; /** If the operation fails somehow we will abort the program */

            return state[effect] >= 0;
        }

        return { state, code }
    }
}

type OperationDefinition = {
    param?: string | number | Array<string>,
    opts: Record<string, string | number | boolean | Array<string>>
}

export const getOperationDefinition = (effects: EffectOperation): OperationDefinition => {

    const definition: OperationDefinition = {
        param: undefined,
        opts: {}
    }

    for (const effect in effects) {
        if (effect.includes(".")) {
            const optKey = effect.split(".").pop()!
            definition.opts[optKey] = effects[effect]! as string | number
            continue;
        }

        definition.param = effects[effect] as string | number | Array<string>
    }

    return definition
}

export const applyImageEffects = (sharp: Sharp, effects: ParsedQs, allowedEffects: Record<ImageEffect, number>): Result<number, Error> => {

    const state = initEffectsState(cloneDeep(allowedEffects));
    const effectsKeys = Object.keys(effects)

    for (let i = 0; i < effectsKeys.length;) {

        let effect = effectsKeys[i];
        const batch: EffectOperation = {}
        const effectKey = effect.split(".")[0].replace("_", "") /** Several operations of the same kind must be prefixed with as many undescores (_) as times the operation was previously requested */

        do {

            batch[effect] = effects[effect];
            effect = effectsKeys[++i];

        } while (effect && effect.startsWith(effectKey));

        let result: Result<number, Error> = Ok(200);

        switch (effectKey) {
            case "rotate": {
                if (state(ImageEffect.ROTATE))
                    result = applyRotationEffect(sharp, batch);
            }
                break;
            case "flip": {
                if (state(ImageEffect.FLIP))
                    result = applyFlipEffect(sharp, batch);
            }
                break;
            case "flop": {
                if (state(ImageEffect.FLOP))
                    result = applyFlopEffect(sharp, batch);
            }
                break;
            case "affine": {
                if (state(ImageEffect.AFFINE))
                    result = applyAffineEffect(sharp, batch);
            }
                break;
            case "sharpen": {
                if (state(ImageEffect.SHARPEN))
                    result = applySharpenEffect(sharp, batch);
            }
                break;
            case "median": {
                if (state(ImageEffect.MEDIAN))
                    result = applyMedianEffect(sharp, batch);
            }
                break;
            case "blur": {
                if (state(ImageEffect.BLUR))
                    result = applyBlurEffect(sharp, batch);
            }
                break;
            case "flatten": {
                if (state(ImageEffect.FLATTEN))
                    result = applyFlattenEffect(sharp, batch);
            }
                break;
            case "unflatten": {
                if (state(ImageEffect.UNFLATTEN))
                    result = applyUnflattenEffect(sharp, batch);
            }
                break;
            case "gamma": {
                if (state(ImageEffect.GAMMA))
                    result = applyGammaEffect(sharp, batch);
            }
                break;
            case "negate": {
                if (state(ImageEffect.NEGATE))
                    result = applyNegateEffect(sharp, batch);
            }
                break;
            case "normalize":
            case "normalise": {
                if (state(ImageEffect.NORMALISE))
                    result = applyNormaliseEffect(sharp, batch);
            }
                break;
            case "clahe": {
                if (state(ImageEffect.CLAHE))
                    result = applyClaheEffect(sharp, batch);
            }
                break;
            case "convolve": {
                if (state(ImageEffect.CONVOLVE))
                    result = applyConvolveEffect(sharp, batch);
            }
                break;
            case "threshold": {
                if (state(ImageEffect.THRESHOLD))
                    result = applyThresholdEffect(sharp, batch);
            }
                break;
            case "boolean": {
                if (state(ImageEffect.BOOLEAN))
                    result = applyBooleanEffect(sharp, batch);
            }
                break;
            case "linear": {
                if (state(ImageEffect.LINEAR))
                    result = applyLinearEffect(sharp, batch);
            }
                break;
            case "recomb": {
                if (state(ImageEffect.RECOMB))
                    result = applyRecombEffect(sharp, batch);
            }
                break;
            case "modulate": {
                if (state(ImageEffect.MODULATE))
                    result = applyModulateEffect(sharp, batch);
            }
                break;
            case "extend": {
                if (state(ImageEffect.EXTEND))
                    result = applyExtendEffect(sharp, batch);
            }
                break;
            case "extract": {
                if (state(ImageEffect.EXTRACT))
                    result = applyExtractEffect(sharp, batch);
            }
                break;
            case "trim": {
                if (state(ImageEffect.TRIM))
                    result = applyTrimEffect(sharp, batch);
            }
                break;
            case "resize":
                continue; /** Treated later on in converter */
            default:
                console.log(`Ignoring unrecognized effect: ${effectKey}`);
        }

        if (result.err)
            return result;
    }

    const { code }: EffectsState = state() as EffectsState;
    return Ok(code);

}