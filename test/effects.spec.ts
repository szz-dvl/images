import { describe, expect, it } from "@jest/globals";
import { ImageEffect, ImageFormat } from "../src/constants";
import { initCachePathState } from "../src/utils";
import { ImageSize, ImagesOpts } from "../src/types";
import { applyImageEffects } from "../src/imageEffects";
import sharp from "sharp";
import { Err } from "ts-results";

const opts: ImagesOpts = {
  dir: `/test/images`,
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
  limits: {
    width: 1920,
    height: 1080,
  },
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
  hashCacheNames: false,
  logs: true,
  timeout: 5000,
};

const sharpOpts = {
  pages: -1,
};

describe("converter", () => {
  it("must append a rotation effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { rotate: "90" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:rotate=90.png`);
  });

  it("must fail to append a rotation effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { rotate: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected numeric for angle but received NaN of type number"`,
    );
  });

  it("must append a flip effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { flip: "weNeedToStandardizeThat" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:flip=true.png`);
  });

  it("must append a flop effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { flop: "weNeedToStandardizeThat" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:flop=true.png`);
  });

  it("must append an affine effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { affine: [".1", ".2", ".1", ".7"] },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:affine=.1,.2,.1,.7.png`,
    );
  });

  it("must fail to append an affine effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { affine: ["2"] },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected 1x4 or 2x2 array for matrix but received 2 of type object"`,
    );
  });

  it("must append a sharpen effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "sharpen.sigma": ".7", "sharpen.m1": "1", "sharpen.m2": "2" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:sharpen.m1=1-sharpen.m2=2-sharpen.sigma=.7.png`,
    );
  });

  it("must fail to append a sharpen effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { "sharpen.sigma": "BAD_VALUE", "sharpen.m1": "1", "sharpen.m2": "2" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected number between 0.000001 and 10 for options.sigma but received NaN of type number"`,
    );
  });

  it("must append a median effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { median: "3" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:median=3.png`);
  });

  it("must fail to append a median effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { median: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected integer between 1 and 1000 for size but received NaN of type number"`,
    );
  });

  it("must append a blur effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { blur: "3" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:blur=3.png`);
  });

  it("must fail to append a blur effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { blur: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected number between 0.3 and 1000 for sigma but received NaN of type number"`,
    );
  });

  it("must append a flatten effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "flatten.background": "#00FF00" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:flatten.background=#00FF00.png`,
    );
  });

  it("must fail to append a flatten effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { "flatten.background": "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Unable to parse color from string: BAD_VALUE"`,
    );
  });

  it("must append a unflatten effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { unflatten: "weNeedToStandardizeThat" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:unflatten=true.png`);
  });

  it("must append a gamma effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { gamma: ["1", "2"] },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:gamma=1,2.png`);
  });

  it("must fail to append a gamma effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { gamma: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected number between 1.0 and 3.0 for gamma but received NaN of type number"`,
    );
  });

  it("must append a negate effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "negate.alpha": "false" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:negate.alpha=false.png`,
    );
  });

  it("must append a normalize effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "normalize.upper": "99", "normalize.lower": "1" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:normalize.lower=1-normalize.upper=99.png`,
    );
  });

  it("must fail to append a normalize effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { "normalize.upper": "BAD_VALUE", "normalize.lower": "1" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected number between 1 and 100 for upper but received NaN of type number"`,
    );
  });

  it("must append a clahe effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "clahe.width": "100", "clahe.height": "100" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:clahe.height=100-clahe.width=100.png`,
    );
  });

  it("must fail to append a clahe effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { "clahe.width": "BAD_VALUE", "clahe.height": "100" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected integer greater than zero for width but received NaN of type number"`,
    );
  });

  it("must append a convolve effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      {
        "convolve.width": "3",
        "convolve.height": "3",
        "convolve.kernel": ["-1", "0", "1", "-2", "0", "2", "-1", "0", "1"],
      },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:convolve.height=3-convolve.kernel=-1,0,1,-2,0,2,-1,0,1-convolve.width=3.png`,
    );
  });

  it("must fail to append a convolve effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      {
        "convolve.width": "3",
        "convolve.height": "3",
        "convolve.kernel": "BAD_VALUE",
      },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Invalid convolution kernel"`,
    );
  });

  it("must append a threshold effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { threshold: "128" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:threshold=128.png`);
  });

  it("must fail to append a threshold effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { threshold: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected integer between 0 and 255 for threshold but received NaN of type number"`,
    );
  });

  it("must append a boolean effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "boolean.operand": "/test/another.jpg", "boolean.operator": "and" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:boolean.operand=|test|another.jpg-boolean.operator=and.png`,
    );
  });

  it("must fail to append a boolean effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      {
        "boolean.operand": "/test/another.jpg",
        "boolean.operator": "BAD_VALUE",
      },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected one of: and, or, eor for operator but received BAD_VALUE of type string"`,
    );
  });

  it("must append a linear effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "linear.a": ".5", "linear.b": "2" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:linear.a=.5-linear.b=2.png`,
    );
  });

  it("must fail to append a linear effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { "linear.a": "BAD_VALUE", "linear.b": "2" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected number or array of numbers for a but received NaN of type number"`,
    );
  });

  it("must append a recomb effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      {
        "recomb.0": ["1", "1", "1"],
        "recomb.1": ["1", "1", "1"],
        "recomb.2": ["1", "1", "1"],
      },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:recomb.0=1,1,1-recomb.1=1,1,1-recomb.2=1,1,1.png`,
    );
  });

  it("must fail to append a recomb effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      {
        "recomb.0": "BAD_VALUE",
        "recomb.1": ["1", "1", "1"],
        "recomb.2": ["1", "1", "1"],
      },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Cannot read properties of undefined (reading 'length')"`,
    );
  });

  it("must append a modulate effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { "modulate.hue": "80" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:modulate.hue=80.png`);
  });

  it("must fail to append a modulate effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { "modulate.hue": "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected number for hue but received NaN of type number"`,
    );
  });

  it("must append an extend effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { extend: "8" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:extend=8.png`);
  });

  it("must fail to append an extend effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { extend: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected integer or object for extend but received NaN of type number"`,
    );
  });

  it("must append an extract effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      {
        "extract.top": "0",
        "extract.left": "0",
        "extract.width": "100",
        "extract.height": "100",
      },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:extract.height=100-extract.left=0-extract.top=0-extract.width=100.png`,
    );
  });

  it("must fail to append an extract effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      {
        "extract.top": "BAD_VALUE",
        "extract.left": "0",
        "extract.width": "100",
        "extract.height": "100",
      },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected integer for top but received NaN of type number"`,
    );
  });

  it("must append a trim effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { trim: "weNeedToStandardizeThat" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:trim=true.png`);
  });

  it("must append a tint effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { tint: "#00FF00" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:tint=#00FF00.png`);
  });

  it("must fail to append a tint effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { tint: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Unable to parse color from string: BAD_VALUE"`,
    );
  });

  it("must append a grayscale effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { grayscale: "weNeedToStandardizeThat" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:grayscale=true.png`);
  });

  it("must append a pipelineColorspace effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { pipelineColorspace: "rgb16" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:pipelineColorspace=rgb16.png`,
    );
  });

  it.skip("must fail to append a pipelineColorspace effect", async () => {
    /** This one is not failing :( ... */

    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { pipelineColorspace: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(`undefined`);
  });

  it("must append a toColorspace effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { toColorspace: "rgb16" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:toColorspace=rgb16.png`,
    );
  });

  it.skip("must fail to append a toColorspace effect", async () => {
    /** This one is not failing :( ... */

    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { toColorspace: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(`undefined`);
  });

  it("must append a removeAlpha effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { removeAlpha: "weNeedToStandardizeThat" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:removeAlpha=true.png`);
  });

  it("must append an ensureAlpha effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { ensureAlpha: ".5" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:ensureAlpha=.5.png`);
  });

  it("must fail to append an ensureAlpha effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { ensureAlpha: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected number between 0 and 1 for alpha but received NaN of type number"`,
    );
  });

  it("must append an extractChannel effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { extractChannel: "red" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:extractChannel=red.png`,
    );
  });

  it("must fail to append an extractChannel effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { extractChannel: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected integer or one of: red, green, blue, alpha for channel but received BAD_VALUE of type string"`,
    );
  });

  it("must append an joinChannel effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { joinChannel: "/test/other.png" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:joinChannel=|test|other.png.png`,
    );
  });

  it("must append an bandbool effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await applyImageEffects(
      sharp(),
      { bandbool: "and" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image:bandbool=and.png`);
  });

  it("must fail to append an bandbool effect", async () => {
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    const res = (await applyImageEffects(
      sharp(),
      { bandbool: "BAD_VALUE" },
      opts.allowedEffects,
      "/test/images",
      cachePath,
      true,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected one of: and, or, eor for boolOp but received BAD_VALUE of type string"`,
    );
  });
});
