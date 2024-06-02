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
} from "sharp";
import { ImageEffect, ImageFormat } from "./constants";

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
  > /** After effects (rotate, extract) may run twice */;
  allowGenerated: boolean;
  allowComposition: boolean;
  limits: ImageLimits;
  formatOpts?: FormatsOpts;
  hashCacheNames: boolean;
  logs: boolean;
  sharp: Omit<SharpOptions, "create" | "text" | "raw">;
  timeout: number;
};
