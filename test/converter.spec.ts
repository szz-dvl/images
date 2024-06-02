import { describe, expect, it } from "@jest/globals";
import { convertFile } from "../src/convert";
import { ImageEffect, ImageFormat } from "../src/constants";
import { initCachePathState } from "../src/utils";
import { ImageSize, ImagesOpts } from "../src/types";
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

    [ImageEffect.CUSTOM]: 1,
  },
  allowGenerated: true,
  allowComposition: true,
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
  it("must append a resize operation", async () => {
    const path = "image.png";
    const size: ImageSize = [100, 100];

    const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG);

    await convertFile(
      path,
      sharpOpts,
      size,
      ImageFormat.PNG,
      opts,
      {},
      cachePath,
    );

    expect(cachePath()).toBe(`/test/images/.cache/100x100/image.png`);
  });

  it("must convert a file to a new format", async () => {
    /** What we are requested for */
    const cacheFile = "image.jpg";

    /** What we got in disk */
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(
      cacheFile,
      opts,
      size,
      ImageFormat.JPEG,
    );

    await convertFile(
      path,
      sharpOpts,
      size,
      ImageFormat.JPEG,
      opts,
      {},
      cachePath,
    );

    expect(cachePath()).toBe(`/test/images/.cache/image.jpeg`);
  });

  it("must apply an extract effect after a resize operation", async () => {
    /** What we are requested for */
    const cacheFile = "image.jpg";

    /** What we got in disk */
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(
      cacheFile,
      opts,
      size,
      ImageFormat.JPEG,
    );

    await convertFile(
      path,
      sharpOpts,
      size,
      ImageFormat.JPEG,
      opts,
      {
        "extractAfter.top": "0",
        "extractAfter.left": "0",
        "extractAfter.width": "100",
        "extractAfter.height": "100",
      },
      cachePath,
    );

    expect(cachePath()).toBe(
      `/test/images/.cache/image:extractAfter.height=100-extractAfter.left=0-extractAfter.top=0-extractAfter.width=100.jpeg`,
    );
  });

  it("must fail to apply an extract effect after a resize operation", async () => {
    /** What we are requested for */
    const cacheFile = "image.jpg";

    /** What we got in disk */
    const path = "image.png";
    const size: ImageSize = [null, null];

    const cachePath = initCachePathState(
      cacheFile,
      opts,
      size,
      ImageFormat.JPEG,
    );

    const res = (await convertFile(
      path,
      sharpOpts,
      size,
      ImageFormat.JPEG,
      opts,
      {
        "extractAfter.top": "BAD_VALUE",
        "extractAfter.left": "0",
        "extractAfter.width": "100",
        "extractAfter.height": "100",
      },
      cachePath,
    )) as Err<Error>;

    expect(res.val.message).toMatchInlineSnapshot(
      `"Expected integer for top but received NaN of type number"`,
    );
  });
});
