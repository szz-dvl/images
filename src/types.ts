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
    DZI = "dzi"
}

export type FormatsQuality = {
    webp?: number,
    avif?: number
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
    quality?: FormatsQuality
}
