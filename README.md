## Images

This package contains a middleware for express framework to serve and convert images under demand. Image conversion is handled by means of the [sharp](https://www.npmjs.com/package/sharp) npm module.

As sharp can convert an image to a different format, apply size modifications, and other effects to the image, the images resulting from a conversion will be cached in the server for further requests. The main goal is to expose all sharp functionalities through a url.

## Installation

```
npm i --save @szz_dev/images
```

## Usage

The main options object looks as follows:

```typescript
export type ImagesOpts = {
  dir: string;
  url: ImageUrlPattern;
  allowedSizes: Set<ImageSize> | "*";
  allowedFormats: Set<ImageFormat> | "*";
  allowedEffects: Record<ImageEffect, number>;
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
```

The options are defined like:

- **dir:** The absolute path to the directory containing the original images.
- **url:** Url pattern to decode received URLs, this field allows you to enable and disable resize feature for this middleware. By default it looks like:

```typescript
{
    prefix: "/image",
    pattern: "/:dir/:size/:file.:ext",
}
```

**prefix** is a fixed path to match URLs, **pattern** allows you to enable or diable the **size** parameter. Available options are `"/:dir/:size/:file.:ext"` to allow resizing images or `"/:dir/:file.:ext"` to completelly disallow image resizing.

When provided, size parameter becomes mandatory in the URLs, sizes are provided in the form {width}x{height}, by requesting a width or height of 0 we are asking for no resize on that parameter. So, if we have the file file.jpg in our directory, the following url path will serve the original image:

```
/0x0/file.jpg
```

If we provide a size, the resulting image will be resized as requested:

```
/150x0/file.jpg => file.jpg with a width of 150px using the default resize options.

/0x150/file.jpg => file.jpg with a height of 150px using the default resize options.

/150x150/file.jpg => file.jpg with a width and height of 150px using the default resize options.
```

Additionally, by providing a different extension, the file will be converted to the requested format.

```
/150x150/file.png => file.jpg with a width and height of 150px using the default resize options converted to PNG format.
```

This means that two files with the same name in the `dir` folder will be considered the same file, but we need to keep in mind that generated files are cached for further requests.

Supported formats are enumerated in the enum:

```typescript
ImageFormat {
  JPEG = "jpeg",
  PNG = "png",
  WEBP = "webp",
  AVIF = "avif",
  TIFF = "tiff",
  GIF = "gif",
  SVG = "svg",
  JP2 = "jp2",
  HEIF = "heif"
  RAW = "raw"
}
```

Take into account that both JP2 and HEIF images requires a custom libvips build, please refer to [this](https://sharp.pixelplumbing.com/install#custom-libvips) link for more information.

Following with the options object abowe, we have:

- **allowedSizes:** Set of sizes that will be allowed, or the character `"*"` to allow any size.

- **allowedFormats:** Set of formats understood by the middleware, or the character `"*"` to allow any format.

- **allowGenerated:** Boolean indicating if generated images (`create` and `text` options of sharp constructor) are allowed.

- **allowComposition:** Boolean indicating if composited images (`composite` operation) are allowed.

- **limits:** Limits for width and height conversions:

```typescript
export type ImageLimits = {
  width: number;
  height: number;
};
```

- **formatOpts:** Options for format conversion, please refer to [output options](https://sharp.pixelplumbing.com/api-output) for more information:

```typescript
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
```

- **hashCacheNames:** Hash the effects applied to an image to generate the name in cache. This option is highly recommended and it will probably disapear in future versions.

- **logs:** Whether to log to console or not.

- **sharp:** Options for sharp.

- **timeout:** Conversion timeout.

- **customEffects:** A map of custom effects to be applied using the `custom` / `customAfter` keys.

- **publicCacheNames:** When true the cache suffix will be returned in the header `X-Images-Cache-Suffix`.

### Effects

We are able to convert and resize images, but sharp can do a lot more than that. To expose sharp functionalities we will use the query string in our URL. The format of the query string follows the pattern of the sharp parameters for each method, as an instance:

```
/150x150/file.png?modulate.hue=80 => file.jpg with a width and height of 150px using the default resize options converted to PNG format and with a modulate operation of 80 degrees on hue applied.
```

Main function parameters expects no dot in the query parameter, as an instance a rotation of 90 degrees may be expressed as:

```
/150x150/file.png?rotate=90 => file.jpg with a width and height of 150px using the default resize options converted to PNG format and with a rotate operation of 90 degrees applied.
```

So, as a general rule, the URLs must look like:

```
/{width}x{height}/{filename}.{desiredformat}?{operation1}={operation1 param}&{operation1}.{operation1option}={operation1 option}&{operation2}={operation2 param} ... {operationN}={operationN param}&{operationN}.{operationNoption}={operationN option}
```

Some exeptions to this roule are:

- **boolean:** The parameters for raw re discarded in this operation.
- **linear:** The two parameters `a` and `b` must be provided as options, like:

```
/150x150/file.png?linear.a=.5&linear.b=2
```

- **composite:** The `input` field of the options object is discarded for composition, an example url must look like:

```
/150x150/file.png?composite.0=other.png&composite.0.blend=add&composite.1.text.text=Hello World
```

The images provided in a parameter are assumed to be relative to the `dir` provided in the configuration, this applies to `joinChannel` effect too.

- **recomb:** As in the composite case, the index of the recomb array must be provided in the query, following the example in sharp [documentation](https://sharp.pixelplumbing.com/api-operation#recomb):

```
/0x0/file.png?recomb.0=.3588&recomb.0=.7044&&recomb.0=.1368&recomb.1=.2990&recomb.1=.5870&&recomb.1=.1140&recomb.2=.2392&recomb.2=.4696&&recomb.2=.0912
```

This url will return the image file.png with a sepia filter applied.

- **gamma:** This operation may take an integer as argument or an array of integer if gammaOut needs to be provided.

- **joinChannel:** Generated images for joinChannel are not supported, the options provided to the method will be the ones provided in the constructor.

Whenever a color needs to be provided only the hexadecimal string representation of the color is allowed (#000000).

Besides sharp operations, there is a couple of "virtual" keys `extractAfter` and `rotateAfter` to apply extractions/rotations after the resize operation, the signature is the same that for `extract` and `rotate` operations, which by default, happens before the resize.

Only one effect of each kind is allowed per request.

In the section `Open Api` you can find an specifiation for a PathItem compliant with OAS 3.0 with the input parameters defined able to composite images with up to one more image.

### Custom images

By using the keys `custom` and `customAfter` you may apply effects previously configured in the server, assuming a config like:

```typescript
{
  ...

    customEffects: {
      sepia: (sharp, _opts) => {
        sharp.recomb([
          [0.3588, 0.7044, 0.1368],
          [0.299, 0.587, 0.114],
          [0.2392, 0.4696, 0.0912],
        ]);
      },
    },

  ...
};
```

The following url will apply a sepia filter to our file:

```
/0x0/file.png?custom=sepia
```

### Genarated images

Sharp is able to generate images from text or create images given some parameters, this functionality is offered in the query string of our request through the keys `create` and `text`. It follows the same pattern described by effects, please refer to [sharp documentation](https://sharp.pixelplumbing.com/api-constructor) for further details. As an instance:

```
/0x0/generated.png?text.text=<span foreground="red" size="xx-large">szz</span><span background="cyan" size="xx-small">software</span>&text.height=250&text.width=250&text.rgba=true&tint=%2300FF00
```

Will generate a promotional image :)

When generating files the filename and extension provided in the URL are used to generate the file in cache, so this name must not exists in the original images folder, otherwise an error is returned.

### Simple server

The options used here are the default values:

```typescript
const { ImageEffect, Images } = require("images");
const express = require("express");

const images = new Images({
  dir: `${__dirname}/images`,
  url: {
    prefix: "/image",
    pattern: "/:dir/:size/:file.:ext",
  },
  allowedSizes: "*",
  allowedFormats: "*",
  allowedEffects: {
    /** Resize */
    [ImageEffect.EXTEND]: 1,
    [ImageEffect.EXTRACT]: 1,
    [ImageEffect.TRIM]: 1,

    /** Operations */
    [ImageEffect.ROTATE]: 1,
    [ImageEffect.FLIP]: 1,
    [ImageEffect.FLOP]: 1,
    [ImageEffect.AFFINE]: 1,
    [ImageEffect.SHARPEN]: 1,
    [ImageEffect.MEDIAN]: 1,
    [ImageEffect.BLUR]: 1,
    [ImageEffect.FLATTEN]: 1,
    [ImageEffect.UNFLATTEN]: 1,
    [ImageEffect.GAMMA]: 1,
    [ImageEffect.NEGATE]: 1,
    [ImageEffect.NORMALISE]: 1,
    [ImageEffect.CLAHE]: 1,
    [ImageEffect.CONVOLVE]: 1,
    [ImageEffect.THRESHOLD]: 1,
    [ImageEffect.BOOLEAN]: 1,
    [ImageEffect.LINEAR]: 1,
    [ImageEffect.RECOMB]: 1,
    [ImageEffect.MODULATE]: 1,

    /** Color */
    [ImageEffect.TINT]: 1,
    [ImageEffect.GRAYSCALE]: 1,
    [ImageEffect.PIPELINECOLORSPACE]: 1,
    [ImageEffect.TOCOLORSPACE]: 1,

    /** Channel */
    [ImageEffect.REMOVEALPHA]: 1,
    [ImageEffect.ENSUREALPHA]: 1,
    [ImageEffect.EXTRACTCHANNEL]: 1,
    [ImageEffect.JOINCHANNEL]: 1,
    [ImageEffect.BANDBOOL]: 1,

    /* User defined */
    [ImageEffect.CUSTOM]: 2,
  },
  allowGenerated: true,
  allowComposition: true,
  sharp: {
    failOn: "warning",
    pages: -1 /** Consider all the pages for multi-page images */,
    limitInputPixels: 268402689,
    unlimited: false,
    sequentialRead: true,
    density: 72,
    ignoreIcc: false,
    page: 0,
    subifd: -1,
    level: 0,
    animated: true /** Same as above */,
  },
  limits: {
    width: 1920,
    height: 1080,
  },
  hashCacheNames: true,
  logs: false,
  timeout: 5000,
  customEffects: {
    sepia: (sharp, _opts) => {
      sharp.recomb([
        [0.3588, 0.7044, 0.1368],
        [0.299, 0.587, 0.114],
        [0.2392, 0.4696, 0.0912],
      ]);
    },
  },
  publicCacheNames: false,
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();

app.use(images.middleware.bind(images));

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
```

### Open Api

Given that the functionality offered in this package is made available through an express middleware, makes sense to provide an Open Api spec to validate incoming requests, the following PathItem specification must validate requests to our endpoint if we are using "/image" as prefix:

```yaml
/image/{size}/{path}:
  summary: Request an image
  description: Request an image
  get:
    tags:
      - image
    summary: Request an image
    description: Request an image
    operationId: image
    parameters:
      - in: path
        name: size
        schema:
          type: string
          pattern: '^\\d+x{1}|x{1}\\d+|\\d+x{1}\\dx+$'
        required: true
        description: Size as understood by @szz_dev/images
      - in: path
        name: path
        schema:
          type: string
          pattern: "(?:/(.+?))?"
        required: true
        description: Path to the file to convert
      - in: query
        name: create.width
        schema:
          type: number
      - in: query
        name: create.height
        schema:
          type: number
      - in: query
        name: create.channels
        schema:
          type: number
      - in: query
        name: create.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: create.noise.type
        schema:
          type: string
          enum:
            - gaussian
      - in: query
        name: create.noise.mean
        schema:
          type: number
      - in: query
        name: create.noise.sigma
        schema:
          type: number
      - in: query
        name: text.width
        schema:
          type: number
      - in: query
        name: text.height
        schema:
          type: number
      - in: query
        name: text.text
        schema:
          type: string
      - in: query
        name: text.font
        schema:
          type: string
      - in: query
        name: text.fontfile
        schema:
          type: string
      - in: query
        name: text.align
        schema:
          type: string
          enum:
            - left
            - center
            - right
      - in: query
        name: text.justify
        schema:
          type: boolean
      - in: query
        name: text.dpi
        schema:
          type: number
      - in: query
        name: text.spacing
        schema:
          type: number
      - in: query
        name: text.wrap
        schema:
          type: string
          enum:
            - word
            - word-char
            - char
            - none
      - in: query
        name: text.rgba
        schema:
          type: boolean
      - in: query
        name: resize.width
        schema:
          type: number
      - in: query
        name: resize.height
        schema:
          type: number
      - in: query
        name: resize.fit
        schema:
          type: string
          enum:
            - cover
            - contain
            - fill
            - inside
            - outside
      - in: query
        name: resize.position
        schema:
          type: string
          enum:
            - top
            - right top
            - right
            - right bottom
            - bottom
            - left bottom
            - left
            - left top
      - in: query
        name: resize.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: resize.kernel
        schema:
          type: string
          enum:
            - nearest
            - linear
            - cubic
            - mitchell
            - lanczos2
            - lanczos3
      - in: query
        name: resize.withoutEnlargement
        schema:
          type: boolean
      - in: query
        name: resize.withoutReduction
        schema:
          type: boolean
      - in: query
        name: resize.fastShrinkOnLoad
        schema:
          type: boolean
      - in: query
        name: extend
        schema:
          type: number
      - in: query
        name: extend.top
        schema:
          type: number
      - in: query
        name: extend.left
        schema:
          type: number
      - in: query
        name: extend.bottom
        schema:
          type: number
      - in: query
        name: extend.right
        schema:
          type: number
      - in: query
        name: extend.extendWith
        schema:
          type: string
          enum:
            - background
            - copy
            - repeat
            - mirror
      - in: query
        name: extend.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: extract.top
        schema:
          type: number
      - in: query
        name: extract.left
        schema:
          type: number
      - in: query
        name: extract.width
        schema:
          type: number
      - in: query
        name: extract.height
        schema:
          type: number
      - in: query
        name: extractAfter.top
        schema:
          type: number
      - in: query
        name: extractAfter.left
        schema:
          type: number
      - in: query
        name: extractAfter.width
        schema:
          type: number
      - in: query
        name: extractAfter.height
        schema:
          type: number
      - in: query
        name: trim
        schema:
          type: boolean
      - in: query
        name: trim.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: trim.threshold
        schema:
          type: number
      - in: query
        name: trim.lineArt
        schema:
          type: boolean
      - in: query
        name: rotate
        schema:
          type: number
      - in: query
        name: rotate.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: rotateAfter
        schema:
          type: number
      - in: query
        name: rotateAfter.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: flip
        schema:
          type: boolean
      - in: query
        name: flop
        schema:
          type: boolean
      - in: query
        name: affine
        schema:
          type: array
          items:
            type: number
          maxItems: 4
          minItems: 4
      - in: query
        name: affine.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: affine.idx
        schema:
          type: number
      - in: query
        name: affine.idy
        schema:
          type: number
      - in: query
        name: affine.odx
        schema:
          type: number
      - in: query
        name: affine.ody
        schema:
          type: number
      - in: query
        name: affine.interpolator
        schema:
          type: string
          enum:
            - nearest
            - bilinear
            - bicubic
            - lbb
            - nohalo
            - vsqbs
      - in: query
        name: sharpen
        schema:
          type: boolean
      - in: query
        name: sharpen.sigma
        schema:
          type: number
      - in: query
        name: sharpen.m1
        schema:
          type: number
          minimum: 0
          maximum: 1000000
      - in: query
        name: sharpen.m2
        schema:
          type: number
          minimum: 0
          maximum: 1000000
      - in: query
        name: sharpen.x1
        schema:
          type: number
          minimum: 0
          maximum: 1000000
      - in: query
        name: sharpen.y2
        schema:
          type: number
          minimum: 0
          maximum: 1000000
      - in: query
        name: sharpen.y3
        schema:
          type: number
          minimum: 0
          maximum: 1000000
      - in: query
        name: median
        schema:
          type: number
      - in: query
        name: blur
        schema:
          type: number
          minimum: .3
          maximum: 1000
      - in: query
        name: flatten
        schema:
          type: boolean
      - in: query
        name: flatten.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: unflatten
        schema:
          type: boolean
      - in: query
        name: gamma
        schema:
          oneOf:
            - type: number
              minimum: 1
              maximum: 3
            - type: array
              items:
                type: number
                minimum: 1
                maximum: 3
              maxItems: 2
              minItems: 2
      - in: query
        name: negate
        schema:
          type: boolean
      - in: query
        name: negate.alpha
        schema:
          type: boolean
      - in: query
        name: normalise
        schema:
          type: boolean
      - in: query
        name: normalise.upper
        schema:
          type: number
          minimum: 1
          maximum: 99
      - in: query
        name: normalise.lower
        schema:
          type: number
          minimum: 1
          maximum: 99
      - in: query
        name: normalize
        schema:
          type: boolean
      - in: query
        name: normalize.upper
        schema:
          type: number
          minimum: 1
          maximum: 99
      - in: query
        name: normalize.lower
        schema:
          type: number
          minimum: 1
          maximum: 99
      - in: query
        name: clahe.width
        schema:
          type: number
      - in: query
        name: clahe.height
        schema:
          type: number
      - in: query
        name: clahe.maxSlope
        schema:
          type: number
          minimum: 0
          maximum: 100
      - in: query
        name: convolve.width
        schema:
          type: number
      - in: query
        name: convolve.height
        schema:
          type: number
      - in: query
        name: convolve.kernel
        schema:
          type: array
          items:
            type: number
      - in: query
        name: convolve.scale
        schema:
          type: number
      - in: query
        name: convolve.offset
        schema:
          type: number
      - in: query
        name: threshold
        schema:
          type: number
          minimum: 0
          maximum: 255
      - in: query
        name: threshold.greyscale
        schema:
          type: boolean
      - in: query
        name: threshold.grayscale
        schema:
          type: boolean
      - in: query
        name: boolean.operand
        schema:
          type: string
      - in: query
        name: boolean.operator
        schema:
          type: string
          enum:
            - and
            - or
            - eor
      - in: query
        name: linear.a
        schema:
          oneOf:
            - type: number
            - type: array
              items:
                type: number
      - in: query
        name: linear.b
        schema:
          oneOf:
            - type: number
            - type: array
              items:
                type: number
      - in: query
        name: recomb.0
        schema:
          type: array
          items:
            type: number
          maxItems: 3
          minItems: 3
      - in: query
        name: recomb.1
        schema:
          type: array
          items:
            type: number
          maxItems: 3
          minItems: 3
      - in: query
        name: recomb.2
        schema:
          type: array
          items:
            type: number
          maxItems: 3
          minItems: 3
      - in: query
        name: modulate.brightness
        schema:
          type: number
      - in: query
        name: modulate.saturation
        schema:
          type: number
      - in: query
        name: modulate.hue
        schema:
          type: number
      - in: query
        name: modulate.lightness
        schema:
          type: number
      - in: query
        name: tint
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: greyscale
        schema:
          type: boolean
      - in: query
        name: grayscale
        schema:
          type: boolean
      - in: query
        name: pipelineColorspace
        schema:
          type: string
          enum:
            - multiband
            - b-w
            - histogram
            - xyz
            - lab
            - cmyk
            - labq
            - rgb
            - cmc
            - lch
            - labs
            - srgb
            - yxy
            - fourier
            - rgb16
            - grey16
            - matrix
            - scrgb
            - hsv
      - in: query
        name: pipelineColourspace
        schema:
          type: string
          enum:
            - multiband
            - b-w
            - histogram
            - xyz
            - lab
            - cmyk
            - labq
            - rgb
            - cmc
            - lch
            - labs
            - srgb
            - yxy
            - fourier
            - rgb16
            - grey16
            - matrix
            - scrgb
            - hsv
      - in: query
        name: toColorspace
        schema:
          type: string
          enum:
            - multiband
            - b-w
            - histogram
            - xyz
            - lab
            - cmyk
            - labq
            - rgb
            - cmc
            - lch
            - labs
            - srgb
            - yxy
            - fourier
            - rgb16
            - grey16
            - matrix
            - scrgb
            - hsv
      - in: query
        name: toColourspace
        schema:
          type: string
          enum:
            - multiband
            - b-w
            - histogram
            - xyz
            - lab
            - cmyk
            - labq
            - rgb
            - cmc
            - lch
            - labs
            - srgb
            - yxy
            - fourier
            - rgb16
            - grey16
            - matrix
            - scrgb
            - hsv
      - in: query
        name: removeAlpha
        schema:
          type: boolean
      - in: query
        name: ensureAlpha
        schema:
          type: number
          minimum: 0
          maximum: 1
      - in: query
        name: extractChannel
        schema:
          type: string
          enum:
            - "0"
            - "1"
            - "2"
            - "3"
            - red
            - green
            - blue
            - alpha
      - in: query
        name: joinChannel
        schema:
          oneOf:
            - type: string
            - type: array
              items:
                type: string
      - in: query
        name: bandbool
        schema:
          type: string
          enum:
            - and
            - or
            - eor
      - in: query
        name: custom
        schema:
          type: string
      - in: query
        name: customAfter
        schema:
          type: string
      - in: query
        name: composite.0
        schema:
          type: string
      - in: query
        name: composite.0.blend
        schema:
          type: string
          enum:
            - clear
            - source
            - over
            - in
            - out
            - atop
            - dest
            - dest-over
            - dest-in
            - dest-out
            - dest-atop
            - xor
            - add
            - saturate
            - multiply
            - screen
            - overlay
            - darken
            - lighten
            - colour-dodge
            - color-dodge
            - colour-burn
            - color-burn
            - hard-light
            - soft-light
            - difference
            - exclusion
      - in: query
        name: composite.0.gravity
        schema:
          type: string
          enum:
            - center
      - in: query
        name: composite.0.create.top
        schema:
          type: number
      - in: query
        name: composite.0.create.left
        schema:
          type: number
      - in: query
        name: composite.0.create.density
        schema:
          type: number
      - in: query
        name: composite.0.create.tile
        schema:
          type: boolean
      - in: query
        name: composite.0.create.premultiplied
        schema:
          type: boolean
      - in: query
        name: composite.0.create.width
        schema:
          type: number
      - in: query
        name: composite.0.create.height
        schema:
          type: number
      - in: query
        name: composite.0.create.channels
        schema:
          type: number
      - in: query
        name: composite.0.create.background
        schema:
          type: string
          pattern: "^#[0-9A-F]{6}$"
      - in: query
        name: composite.0.create.noise.type
        schema:
          type: string
          enum:
            - gaussian
      - in: query
        name: composite.0.create.noise.mean
        schema:
          type: number
      - in: query
        name: composite.0.create.noise.sigma
        schema:
          type: number
      - in: query
        name: composite.0.text.width
        schema:
          type: number
      - in: query
        name: composite.0.text.height
        schema:
          type: number
      - in: query
        name: composite.0.text.text
        schema:
          type: string
      - in: query
        name: composite.0.text.font
        schema:
          type: string
      - in: query
        name: composite.0.text.fontfile
        schema:
          type: string
      - in: query
        name: composite.0.text.align
        schema:
          type: string
          enum:
            - left
            - center
            - right
      - in: query
        name: composite.0.text.justify
        schema:
          type: boolean
      - in: query
        name: composite.0.text.dpi
        schema:
          type: number
      - in: query
        name: composite.0.text.spacing
        schema:
          type: number
      - in: query
        name: composite.0.text.wrap
        schema:
          type: string
          enum:
            - word
            - word-char
            - char
            - none
      - in: query
        name: composite.0.text.rgba
        schema:
          type: boolean
```
