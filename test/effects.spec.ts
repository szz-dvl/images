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
        pages: -1, /** Consider all the pages for multi-page images */
        limitInputPixels: 268402689,
        unlimited: false,
        sequentialRead: true,
        density: 72,
        ignoreIcc: false,
        page: 0,
        subifd: -1,
        level: 0,
        animated: true, /** Same as above */
    }
}

const sharpOpts = {
    pages: -1
}

describe("converter", () => {

    /** 
     * If a paramter is invalid sharp will complain aborting the operation, thus never writting files to cache.
     * We need however, to take into account values provided for "boolean" like operations like:
     * 
     *  - flip
     *  - flop
     *  - unflatten
     *  - negate
     *  - removeAlpha
     * 
     * Same applies for operations with two supported names like normalize/normalise or toColorSpace/toColourSppace.
     * 
     * We need to ensure that each file is produced once in the cache, trying to avoid DDOS attacks. At the same time, different background colors 
     * or legit params may produce valid files, so CORS seems to be mandatory for this middleware to be useful.
     */

    it("must append a rotation effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { rotate: "90" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:rotate=90.png`);
    })

    it("must fail to append a rotation effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { rotate: "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected numeric for angle but received NaN of type number"`);
    })

    it("must append a flip effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { flip: "weNeedToStandardizeThat" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:flip=true.png`);
    })

    it("must append a flop effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { flop: "weNeedToStandardizeThat" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:flop=true.png`);
    })

    it("must append an affine effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { affine: [ ".1",".2",".1",".7" ] }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:affine=.1,.2,.1,.7.png`);
    })

    it("must fail to append an affine effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { affine: ["2"] }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected 1x4 or 2x2 array for matrix but received 2 of type object"`);
    })

    it("must append a sharpen effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "sharpen.sigma": ".7", "sharpen.m1": "1", "sharpen.m2": "2" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:sharpen.sigma=.7-sharpen.m1=1-sharpen.m2=2.png`);
    })

    it("must fail to append a sharpen effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "sharpen.sigma": "BAD_VALUE", "sharpen.m1": "1", "sharpen.m2": "2" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected number between 0.000001 and 10 for options.sigma but received NaN of type number"`);
    })

    it("must append a median effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { median: "3" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:median=3.png`);
    })

    it("must fail to append a median effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { median: "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected integer between 1 and 1000 for size but received NaN of type number"`);
    })

    it("must append a blur effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { blur: "3" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:blur=3.png`);
    })

    it("must fail to append a blur effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { blur: "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected number between 0.3 and 1000 for sigma but received NaN of type number"`);
    })

    it("must append a flatten effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "flatten.background": "#00FF00" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:flatten.background=#00FF00.png`);
    })

    it("must fail to append a flatten effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "flatten.background": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Unable to parse color from string: BAD_VALUE"`);
    })

    it("must append a unflatten effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { unflatten: "weNeedToStandardizeThat" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:unflatten=true.png`);
    })

    it("must append a gamma effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { gamma: [ "1", "2" ] }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:gamma=1,2.png`);
    })

    it("must fail to append a gamma effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { gamma: "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected number between 1.0 and 3.0 for gamma but received NaN of type number"`);
    })

    it("must append a negate effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "negate.alpha": "false" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:negate.alpha=false.png`);
    })

    it("must append a normalize effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "normalize.upper": "99", "normalize.lower": "1" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:normalize.upper=99-normalize.lower=1.png`);
    })

    it("must fail to append a normalize effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "normalize.upper": "BAD_VALUE", "normalize.lower": "1" }, opts.allowedEffects, cachePath) as Err<Error>;

        expect(res.val.message).toMatchInlineSnapshot(`"Expected number between 1 and 100 for upper but received NaN of type number"`);
    })

    it("must append a clahe effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "clahe.width": "100", "clahe.height": "100" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:clahe.width=100-clahe.height=100.png`);
    })

    it("must fail to append a clahe effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "clahe.width": "BAD_VALUE", "clahe.height": "100" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected integer greater than zero for width but received NaN of type number"`);
    })

    it("must append a convolve effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "convolve.width": "3", "convolve.height": "3", "convolve.kernel": [ "-1", "0", "1", "-2", "0" ,"2", "-1", "0", "1" ] }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:convolve.width=3-convolve.height=3-convolve.kernel=-1,0,1,-2,0,2,-1,0,1.png`);
    })

    it("must fail to append a convolve effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "convolve.width": "3", "convolve.height": "3", "convolve.kernel": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Invalid convolution kernel"`);
    })

    it("must append a threshold effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "threshold": "128" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:threshold=128.png`);
    })

    it("must fail to append a threshold effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "threshold": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected integer between 0 and 255 for threshold but received NaN of type number"`);
    })

    it("must append a boolean effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "boolean.operand": "/test/another.jpg", "boolean.operator": "and" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:boolean.operand=|test|another.jpg-boolean.operator=and.png`);
    })

    it("must fail to append a boolean effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "boolean.operand": "/test/another.jpg", "boolean.operator": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected one of: and, or, eor for operator but received BAD_VALUE of type string"`);
    })

    it("must append a linear effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "linear.a": ".5", "linear.b": "2" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:linear.a=.5-linear.b=2.png`);
    })

    it("must fail to append a linear effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "linear.a": "BAD_VALUE", "linear.b": "2" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected number or array of numbers for a but received NaN of type number"`);
    })

    it("must append a recomb effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "recomb.0": ["1", "1", "1"], "recomb.1": ["1", "1", "1"], "recomb.2": ["1", "1", "1"], }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:recomb.0=1,1,1-recomb.1=1,1,1-recomb.2=1,1,1.png`);
    })

    it("must fail to append a recomb effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "recomb.0": "BAD_VALUE", "recomb.1": ["1", "1", "1"], "recomb.2": ["1", "1", "1"], }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Cannot read properties of undefined (reading 'length')"`);
    })

    it("must append a modulate effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "modulate.hue": "80" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:modulate.hue=80.png`);
    })

    it("must fail to append a modulate effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "modulate.hue": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected number for hue but received NaN of type number"`);
    })

    it("must append an extend effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "extend": "8" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:extend=8.png`);
    })

    it("must fail to append an extend effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "extend": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Expected integer or object for extend but received NaN of type number"`);
    })

    it("must append an extract effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "extract.top": "0", "extract.left": "0", "extract.width": "100", "extract.height": "100" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:extract.top=0-extract.left=0-extract.width=100-extract.height=100.png`);
    })

    it("must fail to append an extract effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "extract.top": "BAD_VALUE", "extract.left": "0", "extract.width": "100", "extract.height": "100" }, opts.allowedEffects, cachePath) as Err<Error>;

        expect(res.val.message).toMatchInlineSnapshot(`"Expected integer for top but received NaN of type number"`);
    })

    it("must append a trim effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "trim": "weNeedToStandardizeThat" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:trim=true.png`);
    })

    it("must append a tint effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "tint": "#00FF00" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:tint=#00FF00.png`);
    })

    it("must fail to append a tint effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "tint": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>

        expect(res.val.message).toMatchInlineSnapshot(`"Unable to parse color from string: BAD_VALUE"`);
    })

    it("must append a grayscale effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "grayscale": "weNeedToStandardizeThat" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:grayscale=true.png`);
    })

    it("must append a pipelineColorspace effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "pipelineColorspace": "rgb16" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:pipelineColorspace=rgb16.png`);
    })

    it.skip("must fail to append a pipelineColorspace effect", () => {

        /** This one is not failing :( ... */
        
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "pipelineColorspace": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>
        
        expect(res.val.message).toMatchInlineSnapshot(`undefined`);
    })

    it("must append a toColorspace effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "toColorspace": "rgb16" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:toColorspace=rgb16.png`);
    })

    it.skip("must fail to append a toColorspace effect", () => {

        /** This one is not failing :( ... */
        
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "toColorspace": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>
        
        expect(res.val.message).toMatchInlineSnapshot(`undefined`);
    })

    it("must append a removeAlpha effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "removeAlpha": "weNeedToStandardizeThat" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:removeAlpha=true.png`);
    })

    it("must append an ensureAlpha effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "ensureAlpha": ".5" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:ensureAlpha=.5.png`);
    })

    it("must fail to append an ensureAlpha effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "ensureAlpha": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>;

        expect(res.val.message).toMatchInlineSnapshot(`"Expected number between 0 and 1 for alpha but received NaN of type number"`);
    })

    it("must append an extractChannel effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "extractChannel": "red" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:extractChannel=red.png`);
    })

    it("must fail to append an extractChannel effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "extractChannel": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>;

        expect(res.val.message).toMatchInlineSnapshot(`"Expected integer or one of: red, green, blue, alpha for channel but received BAD_VALUE of type string"`);
    })

    it("must append an joinChannel effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "joinChannel": "/test/other.png" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:joinChannel=|test|other.png.png`);
    })

    it("must append an bandbool effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        applyImageEffects(sharp(), { "bandbool": "and" }, opts.allowedEffects, cachePath)

        expect(cachePath()).toBe(`/test/images/.cache/image:bandbool=and.png`);
    })

    it("must fail to append an bandbool effect", () => {
        const path = "image.png";
        const size: ImageSize = [null, null];

        const cachePath = initCachePathState(path, opts, size, ImageFormat.PNG)

        const res = applyImageEffects(sharp(), { "bandbool": "BAD_VALUE" }, opts.allowedEffects, cachePath) as Err<Error>;

        expect(res.val.message).toMatchInlineSnapshot(`"Expected one of: and, or, eor for boolOp but received BAD_VALUE of type string"`);
    })
})