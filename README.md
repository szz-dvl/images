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
};
```

- **hashCacheNames:** Hash the effects applied to an image to generate the name in cache. This option is highly recommended and it will probably disapear in future versions.

- **logs:** Whether to log to console or not.

- **sharp:** Options for sharp.

- **timeout:** Conversion timeout.

### Effects

We are able to convert and resize images, but sharp can do a lot more than that. To expose sharp functionalities we will use the query string in our URL. The format of the query string follows the pattern of the sharp parameters for each method, as an instance:

```
/150x150/file.png?modulate.hue=80 => file.jpg with a width and height of 150px using the default resize options converted to PNG format and with a modulate operation of 80 degrees applied.
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

- **boolean:** The parameters for raw re discarded in this operation
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

Generated images use the keys `text` and `create`, the following URL will generate an image from text:

```
/0x0/file.png?text.text=test&text.height=150&text.width=150&text.rgba=true
```

Besides sharp operations, there is a couple of "virtual" keys `extractAfter` and `rotateAfter` to apply extractions/rotations after the resize operation, the signature is the same that for `extract` and `rotate` operations, which by default, happens before the resize.

Only one effect of each kind is allowed per request.

### Genarated images

Sharp is able to generate images from text or create images given some parameters, this functionality is offered in the query string of our request through the keys `create` and `text`. It follows the same pattern described by effects, please refer to [sharp documentation](https://sharp.pixelplumbing.com/api-constructor) for further details. As an instance:

```
/0x0/file.png?text.text=<span foreground="red" size="xx-large">szz</span><span background="cyan" size="xx-small">software</span>&text.height=250&text.width=250&text.rgba=true&tint=%2300FF00
```

Will generate a promotional image :)

When generating files the filename and extension provided in the URL are used to generate the file in cache, so this name must not exists in the original images folder, otherwise an error is returned.

### Simple server

```typescript
const { ImageEffect, Images } = require("images");
const express = require("express");

const images = new Images({
  dir: `/home/szz/Pictures`,
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
  logs: true,
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();

app.use(images.middleware.bind(images));

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
```
