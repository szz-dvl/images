import { ParsedQs } from "qs";
import { Sharp } from "sharp";

export { applyAffineEffect } from "./affine";
export { applyBlurEffect } from "./blur";
export { applyBooleanEffect } from "./boolean";
export { applyClaheEffect } from "./clahe";
export { applyConvolveEffect } from "./convolve";
export { applyExtendEffect } from "./extend";
export { applyExtractEffect } from "./extract";
export { applyFlattenEffect } from "./flatten";
export { applyFlipEffect } from "./flip";
export { applyFlopEffect } from "./flop";
export { applyGammaEffect } from "./gamma";
export { applyLinearEffect } from "./linear";
export { applyMedianEffect } from "./median";
export { applyModulateEffect } from "./modulate";
export { applyNegateEffect } from "./negate";
export { applyNormaliseEffect } from "./normalise";
export { applyRecombEffect } from "./recomb";
export { applyRotationEffect } from "./rotate";
export { applySharpenEffect } from "./sharpen";
export { applyThresholdEffect } from "./threshold";
export { applyTrimEffect } from "./trim";
export { applyUnflattenEffect } from "./unflatten";
export { applyTintEffect } from "./tint";
export { applyGrayscaleEffect } from "./grayscale";
export { applyToColorspaceEffect } from "./toColorspace";
export { applyPipelineColorspaceEffect } from "./pipelineColorspace";
export { applyRemoveAlphaEffect } from "./removeAlpha";
export { applyEnsureAlphaEffect } from "./ensureAlpha";
export { applyExtractChannelEffect } from "./extractChannel";
export { applyJoinChannelEffect } from "./joinChannel";
export { applyBandboolEffect } from "./bandbool";
export { applyCustomEffect } from "./custom";

type OperationDefinition = {
  param?: string | number | Array<string>;
  opts: Record<string, string | number | boolean | Array<string>>;
};

export type EffectOperation = Record<
  string,
  undefined | string | string[] | ParsedQs | ParsedQs[]
>;

export const getOperationDefinition = (
  effects: EffectOperation,
): OperationDefinition => {
  const definition: OperationDefinition = {
    param: undefined,
    opts: {},
  };

  for (const effect in effects) {
    if (effect.includes(".")) {
      const optKey = effect.split(".").slice(1).join(".");
      definition.opts[optKey] = effects[effect]! as string | number;
      continue;
    }

    definition.param = effects[effect] as string | number | Array<string>;
  }

  return definition;
};

export type EffectOpts = Record<string, string | number | boolean | string[]>;

export type EffectHandler = (sharp: Sharp, opts: EffectOpts) => void;
