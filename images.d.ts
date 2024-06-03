import {
  AvifOptions,
  GifOptions,
  HeifOptions,
  Jp2Options,
  JpegOptions,
  PngOptions,
  RawOptions,
  SharpOptions,
  TiffOptions,
  WebpOptions,
  Sharp,
} from "sharp";

import { RequestHandler, RouteParameters, Route } from "express";

declare module "@szz_dev/images" {
  export type ImageSize = [number | null, number | null];

  export type FormatsOpts = {
    webp?: WebpOptions;
    avif?: AvifOptions;
    jpeg?: JpegOptions;
    png?: PngOptions;
    tiff?: TiffOptions;
    gif?: GifOptions;
    jp2?: Jp2Options;
    heif?: HeifOptions;
    raw?: RawOptions;
  };

  export type ImageUrlPattern = {
    prefix: string;
    pattern: string;
  };

  export type ImageLimits = {
    width: number;
    height: number;
  };

  export type ImagesOpts = {
    dir: string;
    url: ImageUrlPattern;
    allowedSizes: Set<ImageSize> | "*";
    allowedFormats: Set<ImageFormat> | "*";
    allowedEffects: Record<
      ImageEffect,
      0 | 1 | 2
    > /** After effects (rotate, extract, custom) may run twice */;
    allowGenerated: boolean;
    allowComposition: boolean;
    limits: ImageLimits;
    formatOpts?: FormatsOpts;
    hashCacheNames: boolean;
    logs: boolean;
    sharp: Omit<SharpOptions, "create" | "text" | "raw">;
    timeout: number;
    customEffects?: Record<string, EffectHandler>;
    publicCacheNames: boolean;
  };

  export class Images {
    constructor(ImagesOpts: ImagesOpts);
    middleware: RequestHandler<RouteParameters<Route>>;
  }

  export enum ImageFormat {
    JPEG = "jpeg",
    PNG = "png",
    WEBP = "webp",
    AVIF = "avif",
    TIFF = "tiff",
    GIF = "gif",
    SVG = "svg",
    JP2 = "jp2",
    HEIF = "heif",
    RAW = "raw",
  }

  export enum ImageEffect {
    EXTEND = "extend",
    EXTRACT = "extract",
    TRIM = "trim",
    ROTATE = "rotate",
    FLIP = "flip",
    FLOP = "flop",
    AFFINE = "affine",
    SHARPEN = "sharpen",
    MEDIAN = "median",
    BLUR = "blur",
    FLATTEN = "flatten",
    UNFLATTEN = "unflatten",
    GAMMA = "gamma",
    NEGATE = "negate",
    NORMALISE = "normalise",
    CLAHE = "clahe",
    CONVOLVE = "convolve",
    THRESHOLD = "threshold",
    BOOLEAN = "boolean",
    LINEAR = "linear",
    RECOMB = "recomb",
    MODULATE = "modulate",
    TINT = "tint",
    GRAYSCALE = "grayscale",
    PIPELINECOLORSPACE = "pipelineColorspace",
    TOCOLORSPACE = "toColorspace",
    REMOVEALPHA = "removeAlpha",
    ENSUREALPHA = "ensureAlpha",
    EXTRACTCHANNEL = "extractChannel",
    JOINCHANNEL = "joinChannel",
    BANDBOOL = "bandbool",
    CUSTOM = "custom",
  }

  export type EffectOpts = Record<string, string | number | boolean | string[]>;
  export type EffectHandler = (sharp: Sharp, opts: EffectOpts) => void;
}
