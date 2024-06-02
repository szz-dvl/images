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

  /** Accepting globs in the url we may be able to deal with DZI. Some effects may take advantage of this feature too. */
}

export enum ImageMimeType {
  JPEG = "image/jpeg",
  PNG = "image/png",
  WEBP = "image/webp",
  AVIF = "image/avif",
  TIFF = "image/tiff",
  GIF = "image/gif",
  SVG = "image/svg",
  JP2 = "image/jp2",
  HEIF = "image/heif",
  ANY = "application/octet-stream",
}

export const ImageKnownExtensions = {
  [ImageFormat.JPEG]: ["jpeg", "jpg", "jpe", "jif", "jfif", "jfi"],
  [ImageFormat.PNG]: ["png"],
  [ImageFormat.WEBP]: ["webp"],
  [ImageFormat.AVIF]: ["avif", "avifs"],
  [ImageFormat.TIFF]: ["tiff", "tif"],
  [ImageFormat.GIF]: ["gif"],
  [ImageFormat.SVG]: ["svg", "svgz"],
  [ImageFormat.JP2]: [
    "jp2",
    "j2k",
    "jpf",
    "jpm",
    "jpg2",
    "j2c",
    "jpc",
    "jpx",
    "mj2",
  ],
  [ImageFormat.HEIF]: ["heif", "heifs", "heic", "heics", "avci", "avcs", "HIF"],
};

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
}

export const SharpDuplicatedNaming = {
  [ImageEffect.PIPELINECOLORSPACE]: [
    "pipelineColorspace",
    "pipelineColourspace",
  ],
  [ImageEffect.TOCOLORSPACE]: ["toColorspace", "toColourspace"],
  [ImageEffect.NORMALISE]: ["normalise", "normalize"],
  [ImageEffect.GRAYSCALE]: ["grayscale", "greyscale"],
};

export const SharpBooleanKeys = [
  "flip",
  "flop",
  "unflatten",
  "removeAlpha",
  "negate",
  "negate.alpha",
  "trim",
  "grayscale",
  "text.justify",
  "text.rgba",
  "resize.withoutEnlargement",
  "resize.fastShrinkOnLoad",
  "resize.withoutReduction",
  "threshold.grayscale",
  "threshold.greyscale",
];

export const SharpAngles = ["rotate", "modulate.hue"];
