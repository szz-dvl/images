import { Sharp } from "sharp";
import { Err, Ok, Result } from "ts-results";
import { ParsedQs } from "qs";
import { ImageEffect, SharpValidKeys } from "./constants";
import { cloneDeep, pick } from "lodash";
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
  EffectOperation,
  applyCustomEffect,
} from "./effects";
import { CachePathState } from "./utils";
import { ImagesOpts } from "./types";

export type EffectState = Record<ImageEffect, number>;

type EffectsState = {
  state: EffectState;
  code: number;
};

const initEffectsState = (state: EffectState) => {
  let code = 200;

  return (effect?: ImageEffect): boolean | EffectsState => {
    if (effect) {
      state[effect] -= 1;

      if (state[effect] >= 0)
        code = 201; /** If the operation fails somehow we will abort the program */

      return state[effect] >= 0;
    }

    return { state, code };
  };
};

export const applyImageEffects = (
  sharp: Sharp,
  effects: ParsedQs,
  allowedEffects: Record<ImageEffect, number>,
  opts: ImagesOpts,
  cachePath: CachePathState,
  after: boolean,
): Result<EffectsState, Error> => {
  try {
    const state = initEffectsState(cloneDeep(allowedEffects));
    const effectsKeys = Object.keys(effects);

    for (let i = 0; i < effectsKeys.length; ) {
      let effect = effectsKeys[i];
      const batch: EffectOperation = {};
      const effectKey = effect.split(".")[0];

      do {
        batch[effect] = effects[effect] as string;
        effect = effectsKeys[++i];
      } while (effect && effect.startsWith(effectKey));

      let result: Result<number, Error> = Ok(200);

      switch (effectKey) {
        case "rotate":
          {
            if (!after && state(ImageEffect.ROTATE))
              result = applyRotationEffect(sharp, batch);
          }
          break;
        case "flip":
          {
            if (!after && state(ImageEffect.FLIP))
              result = applyFlipEffect(sharp, batch);
          }
          break;
        case "flop":
          {
            if (!after && state(ImageEffect.FLOP))
              result = applyFlopEffect(sharp, batch);
          }
          break;
        case "affine":
          {
            if (!after && state(ImageEffect.AFFINE))
              result = applyAffineEffect(sharp, batch);
          }
          break;
        case "sharpen":
          {
            if (!after && state(ImageEffect.SHARPEN))
              result = applySharpenEffect(sharp, batch);
          }
          break;
        case "median":
          {
            if (!after && state(ImageEffect.MEDIAN))
              result = applyMedianEffect(sharp, batch);
          }
          break;
        case "blur":
          {
            if (!after && state(ImageEffect.BLUR))
              result = applyBlurEffect(sharp, batch);
          }
          break;
        case "flatten":
          {
            if (!after && state(ImageEffect.FLATTEN))
              result = applyFlattenEffect(sharp, batch);
          }
          break;
        case "unflatten":
          {
            if (!after && state(ImageEffect.UNFLATTEN))
              result = applyUnflattenEffect(sharp, batch);
          }
          break;
        case "gamma":
          {
            if (!after && state(ImageEffect.GAMMA))
              result = applyGammaEffect(sharp, batch);
          }
          break;
        case "negate":
          {
            if (!after && state(ImageEffect.NEGATE))
              result = applyNegateEffect(sharp, batch);
          }
          break;
        case "normalize":
        case "normalise":
          {
            if (!after && state(ImageEffect.NORMALISE))
              result = applyNormaliseEffect(sharp, batch);
          }
          break;
        case "clahe":
          {
            if (!after && state(ImageEffect.CLAHE))
              result = applyClaheEffect(sharp, batch);
          }
          break;
        case "convolve":
          {
            if (!after && state(ImageEffect.CONVOLVE))
              result = applyConvolveEffect(sharp, batch);
          }
          break;
        case "threshold":
          {
            if (!after && state(ImageEffect.THRESHOLD))
              result = applyThresholdEffect(sharp, batch);
          }
          break;
        case "boolean":
          {
            if (!after && state(ImageEffect.BOOLEAN))
              result = applyBooleanEffect(sharp, batch, opts);
          }
          break;
        case "linear":
          {
            if (!after && state(ImageEffect.LINEAR))
              result = applyLinearEffect(sharp, batch);
          }
          break;
        case "recomb":
          {
            if (!after && state(ImageEffect.RECOMB))
              result = applyRecombEffect(sharp, batch);
          }
          break;
        case "modulate":
          {
            if (!after && state(ImageEffect.MODULATE))
              result = applyModulateEffect(sharp, batch);
          }
          break;
        case "extend":
          {
            if (!after && state(ImageEffect.EXTEND))
              result = applyExtendEffect(sharp, batch);
          }
          break;
        case "extract":
          {
            if (!after && state(ImageEffect.EXTRACT))
              result = applyExtractEffect(sharp, batch);
          }
          break;
        case "trim":
          {
            if (!after && state(ImageEffect.TRIM))
              result = applyTrimEffect(sharp, batch);
          }
          break;
        case "tint":
          {
            if (!after && state(ImageEffect.TINT))
              result = applyTintEffect(sharp, batch);
          }
          break;
        case "grayscale":
        case "greyscale":
          {
            if (!after && state(ImageEffect.GRAYSCALE))
              result = applyGrayscaleEffect(sharp, batch);
          }
          break;
        case "pipelineColorspace":
        case "pipelineColourspace":
          {
            if (!after && state(ImageEffect.PIPELINECOLORSPACE))
              result = applyPipelineColorspaceEffect(sharp, batch);
          }
          break;
        case "toColorspace":
        case "toColourspace":
          {
            if (!after && state(ImageEffect.TOCOLORSPACE))
              result = applyToColorspaceEffect(sharp, batch);
          }
          break;
        case "removeAlpha":
          {
            if (!after && state(ImageEffect.REMOVEALPHA))
              result = applyRemoveAlphaEffect(sharp, batch);
          }
          break;
        case "ensureAlpha":
          {
            if (!after && state(ImageEffect.ENSUREALPHA))
              result = applyEnsureAlphaEffect(sharp, batch);
          }
          break;
        case "extractChannel":
          {
            if (!after && state(ImageEffect.EXTRACTCHANNEL))
              result = applyExtractChannelEffect(sharp, batch);
          }
          break;
        case "joinChannel":
          {
            if (!after && state(ImageEffect.JOINCHANNEL))
              result = applyJoinChannelEffect(sharp, batch, opts);
          }
          break;
        case "bandbool":
          {
            if (!after && state(ImageEffect.BANDBOOL))
              result = applyBandboolEffect(sharp, batch);
          }
          break;
        case "extractAfter":
          {
            if (after && state(ImageEffect.EXTRACT))
              result = applyExtractEffect(sharp, batch);
          }
          break;
        case "rotateAfter":
          {
            if (after && state(ImageEffect.ROTATE))
              result = applyRotationEffect(sharp, batch);
          }
          break;
        case "custom":
          {
            if (!after && state(ImageEffect.CUSTOM))
              result = applyCustomEffect(sharp, batch, opts);
          }
          break;
        case "customAfter":
          {
            if (after && state(ImageEffect.CUSTOM))
              result = applyCustomEffect(sharp, batch, opts);
          }
          break;
        case "composite":
        case "text":
        case "create":
        case "resize":
        case "preview":
          continue; /** Treated later on in converter */
        default:
          if (opts.logs)
            console.log(`Ignoring unrecognized effect: ${effectKey}`);
      }

      if (result.err) return result;

      if (result.val === 201) {
        if (opts.logs) console.log(`Applying effect: ${effectKey}`);

        cachePath(pick(batch, SharpValidKeys));
      }
    }

    return Ok(state() as EffectsState);
  } catch (err) {
    return Err(err as Error);
  }
};
