import { BoolEnum, ClaheOptions, Kernel, Matrix3x3, Region, Sharp, SharpenOptions } from "sharp";
import { Ok, Result } from "ts-results";
import { ParsedQs } from "qs";
import { ImageEffect } from "./constants";
import { cloneDeep } from "lodash";

export type EffectOperation = Record<string, undefined | string | string[] | ParsedQs | ParsedQs[]>
type EffectState = Record<ImageEffect, number>

const isAllowedEffect = (effect: ImageEffect, state: EffectState) => {
    state[effect] -= 1

    return state[effect] >= 0;
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

const applyRotationEffect = (sharp: Sharp, rotationEffects: EffectOperation): Result<number, Error> => {

    const { param: rotation, opts } = getOperationDefinition(rotationEffects)

    sharp.rotate(Number(rotation), opts);

    return Ok(201);
}

const applyFlipEffect = (sharp: Sharp, _flipEffects: EffectOperation): Result<number, Error> => {

    sharp.flip();

    return Ok(201);
}

const applyFlopEffect = (sharp: Sharp, _flopEffects: EffectOperation): Result<number, Error> => {

    sharp.flop();

    return Ok(201);
}

const applyAffineEffect = (sharp: Sharp, affineEffects: EffectOperation): Result<number, Error> => {

    const { param, opts } = getOperationDefinition(affineEffects)

    const affineMatrix = (<Array<string>>param).map((elem, idx) => idx < 4 ? Number(elem) : null).filter(elem => elem != 0 && elem)

    sharp.affine(affineMatrix as [number, number, number, number], opts);

    return Ok(201);
}

const applySharpenEffect = (sharp: Sharp, sharpenEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(sharpenEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.sharpen(opts as unknown as SharpenOptions);

    return Ok(201);
}

const applyMedianEffect = (sharp: Sharp, medianEffects: EffectOperation): Result<number, Error> => {

    const { param: median } = getOperationDefinition(medianEffects)

    sharp.median(Number(median));

    return Ok(201);
}

const applyBlurEffect = (sharp: Sharp, medianEffects: EffectOperation): Result<number, Error> => {

    const { param: sigma } = getOperationDefinition(medianEffects)

    sharp.blur(Number(sigma));

    return Ok(201);
}

const applyFlattenEffect = (sharp: Sharp, flattenEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(flattenEffects)

    sharp.flatten(opts);

    return Ok(201);
}

const applyUnflattenEffect = (sharp: Sharp, _unflattenEffects: EffectOperation): Result<number, Error> => {

    sharp.unflatten();

    return Ok(201);
}

const applyGammaEffect = (sharp: Sharp, gammaEffects: EffectOperation): Result<number, Error> => {

    const { param: gamma } = getOperationDefinition(gammaEffects);

    if (Array.isArray(gamma)) {
        sharp.gamma(...gamma.map(g => Number(g)))
        return Ok(201);
    }

    sharp.gamma(Number(gamma))

    return Ok(201);
}

const applyNegateEffect = (sharp: Sharp, negateEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(negateEffects)

    for (const opt in opts) {
        opts[opt] = opts[opt] !== "false";
    }

    sharp.negate(opts);

    return Ok(201);
}

const applyNormaliseEffect = (sharp: Sharp, normaliseEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(normaliseEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.normalise(opts);

    return Ok(201);
}

const applyClaheEffect = (sharp: Sharp, claheEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(claheEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.clahe(opts as unknown as ClaheOptions);

    return Ok(201);
}

const applyConvolveEffect = (sharp: Sharp, convolveEffects: EffectOperation): Result<number, Error> => {

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

    return Ok(201);
}

const applyThresholdEffect = (sharp: Sharp, thresholdEffects: EffectOperation): Result<number, Error> => {

    const { param: threshold, opts } = getOperationDefinition(thresholdEffects)

    for (const opt in opts) {
        opts[opt] = opts[opt] !== "false";
    }

    sharp.threshold(Number(threshold), opts);

    return Ok(201);
}

const applyBooleanEffect = (sharp: Sharp, booleanEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(booleanEffects)

    sharp.boolean(opts.operand as string, opts.operator as keyof BoolEnum);

    return Ok(201);
}

const applyLinearEffect = (sharp: Sharp, linearEffects: EffectOperation): Result<number, Error> => {

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

    return Ok(201);
}

const applyRecombEffect = (sharp: Sharp, recombEffects: EffectOperation): Result<number, Error> => {

    /** Queries must look like: ?recomb.0=1&recomb.0=1 ... &recomb.2=2 */

    const { opts } = getOperationDefinition(recombEffects);
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

    return Ok(201);
}

const applyModulateEffect = (sharp: Sharp, modulateEffects: EffectOperation): Result<number, Error> => {

    const { opts } = getOperationDefinition(modulateEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.modulate(opts);

    return Ok(201);
}

const applyExtendEffect = (sharp: Sharp, extendEffects: EffectOperation): Result<number, Error> => {

    const { param: extend, opts } = getOperationDefinition(extendEffects)

    if (extend) {
        sharp.extend(Number(extend));
        return Ok(201);
    }

    for (const opt in opts) {
        switch (opt) {
            case "top":
            case "left":
            case "bottom":
            case "right":
                opts[opt] = Number(opts[opt])
            case "extendWith":
            case "background":
                opts[opt] = opts[opt].toString()
        }
    }

    sharp.extend(opts);

    return Ok(201);
}

const applyExtractEffect = (sharp: Sharp, extractEffects: EffectOperation): Result<number, Error> => {

    /** A limitation if the package: extract will always happens before resizing  */

    const { opts } = getOperationDefinition(extractEffects)

    for (const opt in opts) {
        opts[opt] = Number(opts[opt])
    }

    sharp.extract(opts as unknown as Region);

    return Ok(201);
}

const applyTrimEffect = (sharp: Sharp, trimEffects: EffectOperation): Result<number, Error> => {

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

export const applyImageEffects = (sharp: Sharp, effects: ParsedQs, allowedEffects: Record<ImageEffect, number>): Result<number, Error> => {

    let code = 200;
    const state: EffectState = cloneDeep(allowedEffects);
    const effectsKeys = Object.keys(effects)

    for (let i = 0; i < effectsKeys.length;) {

        let effect = effectsKeys[i];
        const batch: EffectOperation = {}
        const effectKey = effect.split(".")[0].replace("_", "") /** Several operations of the same kind must be prefixed with as many undescores (_) as times the operation was previously requested */

        do {

            batch[effect] = effects[effect];
            effect = effectsKeys[++i];

        } while (effect && effect.startsWith(effectKey));

        let result: Result<number, Error> = Ok(code);

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
            case "extend": {
                if (isAllowedEffect(ImageEffect.EXTEND, state))
                    result = applyExtendEffect(sharp, batch);
            }
                break;
            case "extract": {
                if (isAllowedEffect(ImageEffect.EXTRACT, state))
                    result = applyExtractEffect(sharp, batch);
            }
                break;
            case "trim": {
                if (isAllowedEffect(ImageEffect.TRIM, state))
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

        code = result.val > code ? result.val : code;
    }

    return Ok(code);

}