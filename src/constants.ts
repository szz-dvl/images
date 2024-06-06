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
  [ImageFormat.RAW]: ["raw"],
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
  CUSTOM = "custom",
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
  "flatten",
  "normalise",
  "removeAlpha",
  "flip",
  "flop",
  "unflatten",
  "removeAlpha",
  "negate",
  "negate.alpha",
  "trim",
  "grayscale",
  "sharpen",
  "text.justify",
  "text.rgba",
  "resize.withoutEnlargement",
  "resize.fastShrinkOnLoad",
  "resize.withoutReduction",
  "threshold.grayscale",
  "threshold.greyscale",
];

export const SharpAngles = ["rotate", "modulate.hue"];

export const SharpValidKeys = [
  "create.width",
  "create.height",
  "create.channels",
  "create.background",
  "create.noise.type",
  "create.noise.mean",
  "create.noise.sigma",

  "text.width",
  "text.height",
  "text.text",
  "text.font",
  "text.fontfile",
  "text.align",
  "text.justify",
  "text.dpi",
  "text.spacing",
  "text.wrap",
  "text.rgba",

  "resize.width",
  "resize.height",
  "resize.fit",
  "resize.position",
  "resize.background",
  "resize.kernel",
  "resize.withoutEnlargement",
  "resize.withoutReduction",
  "resize.fastShrinkOnLoad",

  "extend",
  "extend.top",
  "extend.left",
  "extend.bottom",
  "extend.right",
  "extend.extendWith",
  "extend.background",

  "extract.top",
  "extract.left",
  "extract.width",
  "extract.height",

  "extractAfter.top",
  "extractAfter.left",
  "extractAfter.width",
  "extractAfter.height",

  "trim",
  "trim.background",
  "trim.threshold",
  "trim.lineArt",

  "rotate",
  "rotate.background",

  "rotateAfter",
  "rotateAfter.background",

  "flip",

  "flop",

  "affine",
  "affine.background",
  "affine.idx",
  "affine.idy",
  "affine.odx",
  "affine.ody",
  "affine.interpolator",

  "sharpen",
  "sharpen.sigma",
  "sharpen.m1",
  "sharpen.m2",
  "sharpen.x1",
  "sharpen.y2",
  "sharpen.y3",

  "median",

  "blur",

  "flatten",
  "flatten.background",

  "unflatten",

  "gamma",

  "negate",
  "negate.alpha",

  "normalise",
  "normalise.upper",
  "normalise.lower",
  "normalize",
  "normalize.upper",
  "normalize.lower",

  "clahe.width",
  "clahe.height",
  "clahe.maxSlope",

  "convolve.width",
  "convolve.height",
  "convolve.kernel",
  "convolve.scale",
  "convolve.offset",

  "threshold",
  "threshold.greyscale",
  "threshold.grayscale",

  "boolean.operand",
  "boolean.operator",

  "linear.a",
  "linear.b",

  "recomb.0",
  "recomb.1",
  "recomb.2",

  "modulate.brightness",
  "modulate.saturation",
  "modulate.hue",
  "modulate.lightness",

  "tint",

  "greyscale",
  "grayscale",

  "pipelineColorspace",
  "pipelineColourspace",

  "toColorspace",
  "toColourspace",

  "removeAlpha",

  "ensureAlpha",

  "extractChannel",

  "joinChannel",

  "bandbool",

  "custom",
  "customAfter",
];
