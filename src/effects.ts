import { BoolEnum, ClaheOptions, Kernel, Matrix3x3, Sharp, SharpenOptions } from "sharp";
import { Ok, Result } from "ts-results";
import { ParsedQs } from "qs";
import { ImageEffect } from "./constants";
import { cloneDeep } from "lodash";

type EffectOperation = Record<string, undefined | string | string[] | ParsedQs | ParsedQs[]>
type EffectState = Record<ImageEffect, number>

const isAllowedEffect = (effect: ImageEffect, state: EffectState) => {
    state[effect] -= 1

    return state[effect] >= 0;
}

type OperationDefinition = {
    param?: string | number | Array<string>,
    opts: Record<string, string | number | boolean | Array<string>>
}

const getOperationDefinition = (effects: EffectOperation): OperationDefinition => {

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

const applyRotationEffect = (sharp: Sharp, rotationEffects: EffectOperation): Result<void, Error> => {

    const { param: rotation, opts } = getOperationDefinition(rotationEffects)

    sharp.rotate(Number(rotation), opts);

    return Ok.EMPTY;
}

const applyFlipEffect = (sharp: Sharp, _flipEffects: EffectOperation): Result<void, Error> => {

    sharp.flip();

    return Ok.EMPTY;
}

const applyFlopEffect = (sharp: Sharp, _flopEffects: EffectOperation): Result<void, Error> => {

    sharp.flop();

    return Ok.EMPTY;
}

const applyAffineEffect = (sharp: Sharp, affineEffects: EffectOperation): Result<void, Error> => {

    const { param, opts } = getOperationDefinition(affineEffects)

    const affineMatrix = (<Array<string>>param).map((elem, idx) => idx < 4 ? Number(elem) : null).filter(elem => elem != 0 && elem)

    sharp.affine(affineMatrix as [number, number, number, number], opts);

    return Ok.EMPTY;
}

const applySharpenEffect = (sharp: Sharp, sharpenEffects: EffectOperation): Result<void, Error> => {

    let { opts } = getOperationDefinition(sharpenEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.sharpen(opts as unknown as SharpenOptions);

    return Ok.EMPTY;
}

const applyMedianEffect = (sharp: Sharp, medianEffects: EffectOperation): Result<void, Error> => {

    const { param: median } = getOperationDefinition(medianEffects)

    sharp.median(Number(median));

    return Ok.EMPTY;
}

const applyBlurEffect = (sharp: Sharp, medianEffects: EffectOperation): Result<void, Error> => {

    const { param: sigma } = getOperationDefinition(medianEffects)

    sharp.blur(Number(sigma));

    return Ok.EMPTY;
}

const applyFlattenEffect = (sharp: Sharp, flattenEffects: EffectOperation): Result<void, Error> => {

    const { opts } = getOperationDefinition(flattenEffects)

    sharp.flatten(opts);

    return Ok.EMPTY;
}

const applyUnflattenEffect = (sharp: Sharp, _unflattenEffects: EffectOperation): Result<void, Error> => {

    sharp.unflatten();

    return Ok.EMPTY;
}

const applyGammaEffect = (sharp: Sharp, gammaEffects: EffectOperation): Result<void, Error> => {

    const { param: gamma } = getOperationDefinition(gammaEffects);

    if (Array.isArray(gamma)) {
        sharp.gamma(...gamma.map(g => Number(g)))
        return Ok.EMPTY;
    }

    sharp.gamma(Number(gamma))

    return Ok.EMPTY;
}

const applyNegateEffect = (sharp: Sharp, negateEffects: EffectOperation): Result<void, Error> => {

    let { opts } = getOperationDefinition(negateEffects)

    for (const opt in opts) {
        opts[opt] = opts[opt] != "false"
    }

    sharp.negate(opts);

    return Ok.EMPTY;
}

const applyNormaliseEffect = (sharp: Sharp, normaliseEffects: EffectOperation): Result<void, Error> => {

    let { opts } = getOperationDefinition(normaliseEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.normalise(opts);

    return Ok.EMPTY;
}

const applyClaheEffect = (sharp: Sharp, claheEffects: EffectOperation): Result<void, Error> => {

    let { opts } = getOperationDefinition(claheEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.clahe(opts as unknown as ClaheOptions);

    return Ok.EMPTY;
}

const applyConvolveEffect = (sharp: Sharp, convolveEffects: EffectOperation): Result<void, Error> => {

    const { opts } = getOperationDefinition(convolveEffects);
    const typed: Record<string, number | Array<number>> = {}

    for (const opt in opts) {
        if (Array.isArray(opts[opt])) {
            typed[opt] = (<Array<string>>opts[opt]).map(kernel => Number(kernel))
            continue;
        }

        typed[opt] = Number(opts[opt])
    }

    sharp.convolve(typed as unknown as Kernel)

    return Ok.EMPTY;
}

const applyThresholdEffect = (sharp: Sharp, thresholdEffects: EffectOperation): Result<void, Error> => {

    let { param: threshold, opts } = getOperationDefinition(thresholdEffects)

    for (const opt in opts) {
        opts[opt] = opts[opt] != "false"
    }

    sharp.threshold(Number(threshold), opts);

    return Ok.EMPTY;
}

const applyBooleanEffect = (sharp: Sharp, booleanEffects: EffectOperation): Result<void, Error> => {

    let { opts } = getOperationDefinition(booleanEffects)

    sharp.boolean(opts.operand as string, opts.operator as keyof BoolEnum);

    return Ok.EMPTY;
}

const applyLinearEffect = (sharp: Sharp, linearEffects: EffectOperation): Result<void, Error> => {

    const { opts } = getOperationDefinition(linearEffects);
    const typed: Record<string, number | Array<number>> = {}

    for (const opt in opts) {
        if (Array.isArray(opts[opt])) {
            typed[opt] = (<Array<string>>opts[opt]).map(val => Number(val))
            continue;
        }

        typed[opt] = Number(opts[opt])
    }

    sharp.linear(typed.a, typed.b)

    return Ok.EMPTY;
}

const applyRecombEffect = (sharp: Sharp, recombEffects: EffectOperation): Result<void, Error> => {

    const { opts } = getOperationDefinition(recombEffects);
    const typed: Record<string, number | Array<number>> = {}
    const recombMatrix: Matrix3x3 = [] as unknown as Matrix3x3;

    for (const opt in opts) {
        const idx = Number(opt.split(".").pop())
        if (Array.isArray(opts[opt])) {
            recombMatrix[idx] = (<Array<string>>opts[opt])
                .map((val, idx) => idx < 3 ? Number(val) : null)
                .filter(elem => elem != 0 && elem) as [number, number, number]
        }
    }

    sharp.recomb(recombMatrix)

    return Ok.EMPTY;
}

const applyModulateEffect = (sharp: Sharp, modulateEffects: EffectOperation): Result<void, Error> => {

    let { opts } = getOperationDefinition(modulateEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.modulate(opts);

    return Ok.EMPTY;
}

export const applyImageEffects = (sharp: Sharp, effects: ParsedQs, allowedEffects: Record<ImageEffect, number>): Result<void, Error> => {

    const state: EffectState = cloneDeep(allowedEffects);
    const effectsKeys = Object.keys(effects)

    for (let i = 0; i < effectsKeys.length;) {

        let effect = effectsKeys[i];
        const batch: EffectOperation = {}
        const effectKey = effect.split(".")[0].replace("_", "")

        do {

            batch[effect] = effects[effect];
            effect = effectsKeys[++i];

        } while (effect && effect.startsWith(effectKey));

        let result: Result<void, Error> = Ok.EMPTY;

        switch (effectKey) {
            case "rotate": {
                if (isAllowedEffect(ImageEffect.ROTATE, state))
                    result = applyRotationEffect(sharp, batch);
            }
                break;
            case "flip": {
                if (isAllowedEffect(ImageEffect.FLIP, state))
                    result = applyFlipEffect(sharp, batch);
            }
                break;
            case "flop": {
                if (isAllowedEffect(ImageEffect.FLOP, state))
                    result = applyFlopEffect(sharp, batch);
            }
                break;
            case "affine": {
                if (isAllowedEffect(ImageEffect.AFFINE, state))
                    result = applyAffineEffect(sharp, batch);
            }
                break;
            case "sharpen": {
                if (isAllowedEffect(ImageEffect.SHARPEN, state))
                    result = applySharpenEffect(sharp, batch);
            }
                break;
            case "median": {
                if (isAllowedEffect(ImageEffect.MEDIAN, state))
                    result = applyMedianEffect(sharp, batch);
            }
                break;
            case "blur": {
                if (isAllowedEffect(ImageEffect.BLUR, state))
                    result = applyBlurEffect(sharp, batch);
            }
                break;
            case "flatten": {
                if (isAllowedEffect(ImageEffect.FLATTEN, state))
                    result = applyFlattenEffect(sharp, batch);
            }
                break;
            case "unflatten": {
                if (isAllowedEffect(ImageEffect.UNFLATTEN, state))
                    result = applyUnflattenEffect(sharp, batch);
            }
                break;
            case "gamma": {
                if (isAllowedEffect(ImageEffect.GAMMA, state))
                    result = applyGammaEffect(sharp, batch);
            }
                break;
            case "negate": {
                if (isAllowedEffect(ImageEffect.NEGATE, state))
                    result = applyNegateEffect(sharp, batch);
            }
                break;
            case "normalize":
            case "normalise": {
                if (isAllowedEffect(ImageEffect.NORMALISE, state))
                    result = applyNormaliseEffect(sharp, batch);
            }
                break;
            case "clahe": {
                if (isAllowedEffect(ImageEffect.CLAHE, state))
                    result = applyClaheEffect(sharp, batch);
            }
                break;
            case "convolve": {
                if (isAllowedEffect(ImageEffect.CONVOLVE, state))
                    result = applyConvolveEffect(sharp, batch);
            }
                break;
            case "threshold": {
                if (isAllowedEffect(ImageEffect.THRESHOLD, state))
                    result = applyThresholdEffect(sharp, batch);
            }
                break;
            case "boolean": {
                if (isAllowedEffect(ImageEffect.BOOLEAN, state))
                    result = applyBooleanEffect(sharp, batch);
            }
                break;
            case "linear": {
                if (isAllowedEffect(ImageEffect.LINEAR, state))
                    result = applyLinearEffect(sharp, batch);
            }
                break;
            case "recomb": {
                if (isAllowedEffect(ImageEffect.RECOMB, state))
                    result = applyRecombEffect(sharp, batch);
            }
                break;
            case "modulate": {
                if (isAllowedEffect(ImageEffect.MODULATE, state))
                    result = applyModulateEffect(sharp, batch);
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