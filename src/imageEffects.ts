import { Sharp } from "sharp";
import { Err, Ok, Result } from "ts-results";
import { ParsedQs } from "qs";
import { ImageEffect } from "./constants";
import { cloneDeep } from "lodash";
import { 
    applyRotationEffect, 
    applyFlipEffect, 
    applyFlopEffect, 
    applyAffineEffect, 
    applySharpenEffect, 
    applyMedianEffect, 
    applyBlurEffect, 
    applyFlattenEffect, 
    applyUnflattenEffect, 
    applyGammaEffect, 
    applyNegateEffect, 
    applyNormaliseEffect, 
    applyClaheEffect, 
    applyConvolveEffect, 
    applyThresholdEffect, 
    applyBooleanEffect, 
    applyLinearEffect, 
    applyRecombEffect, 
    applyModulateEffect, 
    applyExtendEffect, 
    applyExtractEffect, 
    applyTrimEffect, 
    applyTintEffect, 
    applyGrayscaleEffect, 
    applyPipelineColorspaceEffect, 
    applyToColorspaceEffect, 
    applyRemoveAlphaEffect, 
    applyEnsureAlphaEffect, 
    applyExtractChannelEffect, 
    applyJoinChannelEffect, 
    applyBandboolEffect, 
    EffectOperation
} from "./effects";
import { CachePathState } from "./utils";

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

export const applyImageEffects = (sharp: Sharp, effects: ParsedQs, allowedEffects: Record<ImageEffect, number>, cachePath: CachePathState): Result<number, Error> => {

    try {
        const state = initEffectsState(cloneDeep(allowedEffects));
        const effectsKeys = Object.keys(effects)

        for (let i = 0; i < effectsKeys.length;) {

            let effect = effectsKeys[i];
            const batch: EffectOperation = {}
            const effectKey = effect.split(".")[0].replaceAll("_", "") /** Several operations of the same kind must be prefixed with as many undescores (_) as times the operation was previously requested */

            do {

                batch[effect] = effects[effect];
                effect = effectsKeys[++i];

            } while (effect && effect.replaceAll("_", "").startsWith(effectKey));

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
                case "tint": {
                    if (state(ImageEffect.TINT))
                        result = applyTintEffect(sharp, batch);
                }
                    break;
                case "grayscale":
                case "greyscale": {
                    if (state(ImageEffect.GRAYSCALE))
                        result = applyGrayscaleEffect(sharp, batch);
                }
                    break;
                case "pipelineColorspace":
                case "pipelineColourspace": {
                    if (state(ImageEffect.PIPELINECOLORSPACE))
                        result = applyPipelineColorspaceEffect(sharp, batch);
                }
                    break;
                case "toColorspace":
                case "toColourspace": {
                    if (state(ImageEffect.PIPELINECOLORSPACE))
                        result = applyToColorspaceEffect(sharp, batch);
                }
                    break;
                case "removeAlpha": {
                    if (state(ImageEffect.REMOVEALPHA))
                        result = applyRemoveAlphaEffect(sharp, batch);
                }
                    break;
                case "ensureAlpha": {
                    if (state(ImageEffect.ENSUREALPHA))
                        result = applyEnsureAlphaEffect(sharp, batch);
                }
                    break;
                case "extractChannel": {
                    if (state(ImageEffect.EXTRACTCHANNEL))
                        result = applyExtractChannelEffect(sharp, batch);
                }
                    break;
                case "joinChannel": {
                    if (state(ImageEffect.JOINCHANNEL))
                        result = applyJoinChannelEffect(sharp, batch);
                }
                    break;
                case "bandbool": {
                    if (state(ImageEffect.BANDBOOL))
                        result = applyBandboolEffect(sharp, batch);
                }
                    break;
                case "text":
                case "create":
                case "resize":
                    continue; /** Treated later on in converter */
                default:
                    console.log(`Ignoring unrecognized effect: ${effectKey}`);
            }
            
            if (result.err)
                return result;

            if (result.val === 201) {
                console.log(`Applying effect: ${effectKey}`);
                cachePath(batch);
            }
        }

        const { code }: EffectsState = state() as EffectsState;
        return Ok(code);
    
    } catch (err) {
        return Err(err as Error);
    }

}