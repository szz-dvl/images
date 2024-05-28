import { AvifOptions, GifOptions, HeifOptions, Jp2Options, JpegOptions, PngOptions, TiffOptions, TileOptions, WebpOptions } from "sharp"

export type ImageSize = [number | null, number | null]

export enum ImageFormat {
    JPEG = "jpeg",
    PNG = "png",
    WEBP = "webp",
    AVIF = "avif",
    TIFF = "tiff",
    GIF = "gif",
    SVG = "svg",
    JP2 = "jp2",
    DZI = "dzi",
    HEIF = "heif"
}

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
    limits: ImageLimits,
    formatOpts?: FormatsOpts
}
