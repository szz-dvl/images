export enum ImageFormat {
    JPEG = "jpeg",
    PNG = "png",
    WEBP = "webp",
    AVIF = "avif",
    TIFF = "tiff",
    GIF = "gif",
    SVG = "svg",
    JP2 = "jp2",
    HEIF = "heif"
}

export enum ImageMimeType {
    JPEG = "image/jpeg",
    PNG = "image/png",
    WEBP = "image/webp",
    AVIF = "application/octet-stream",
    TIFF = "image/tiff",
    GIF = "image/gif",
    SVG = "image/svg",
    JP2 = "image/jp2",
    HEIF = "application/octet-stream",
    ANY = "application/octet-stream"
}

export const ImageKnownExtensions = {
    [ImageFormat.JPEG] : [
        "jpeg", "jpg", "jpe", 
        "jif", "jfif", "jfi"
    ],
    [ImageFormat.PNG]  : ["png"],
    [ImageFormat.WEBP] : ["webp"],
    [ImageFormat.AVIF] : ["avif", "avifs"],
    [ImageFormat.TIFF] : ["tiff", "tif"],
    [ImageFormat.GIF]  : ["gif"],
    [ImageFormat.SVG]  : ["svg", "svgz"],
    [ImageFormat.JP2]  : [
        "jp2", "j2k", "jpf", 
        "jpm", "jpg2", "j2c", 
        "jpc", "jpx", "mj2"
    ],
    [ImageFormat.HEIF] : [
        "heif", "heifs", "heic", 
        "heics", "avci", "avcs", 
        "HIF"
    ]
}
