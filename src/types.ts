import { 
    AvifOptions, 
    GifOptions, 
    HeifOptions, 
    Jp2Options, 
    JpegOptions, 
    PngOptions, 
    TiffOptions, 
    TileOptions, 
    WebpOptions 
} from "sharp"
import { ImageEffect, ImageFormat } from "./constants"

export type ImageSize = [number | null, number | null]

export type FormatsOpts = {
    webp?: WebpOptions,
    avif?: AvifOptions,
    jpeg?: JpegOptions,
    png?: PngOptions,
    tiff?: TiffOptions,
    gif?: GifOptions,
    jp2?: Jp2Options,
    dzi?: TileOptions,
    heif?: HeifOptions
}

export type ImageUrlPattern = {
    prefix: string,
    pattern: string,
}

export type ImageLimits = {
    width: number,
    height: number,
}

export type ImagesOpts = {
    dir: string,
    url: ImageUrlPattern,
    allowedSizes: Set<ImageSize> | "*",
    allowedFormats: Set<ImageFormat> | "*",
    allowedEffects: Record<ImageEffect, number>,
    limits: ImageLimits,
    formatOpts?: FormatsOpts
}
