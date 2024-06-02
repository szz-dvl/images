import { ImagesOpts } from "./types";
import { extractUrlInfo } from "./regex";
import {
  CachePathState,
  allowedSize,
  globExtension,
  initCachePathState,
  isGeneratedImage,
} from "./utils";
import { join } from "node:path";
import {
  CacheWriter,
  checkCache,
  checkFile,
  findFirst,
  getCacheWriter,
} from "./fs";
import { convertFile } from "./convert";
import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { Response, Request, NextFunction } from "express";
import { ImageEffect } from "./constants";
import { getSharpOptions } from "./options";
import { Sharp } from "sharp";
import { addAbortSignal } from "node:stream";
import { EffectOpts } from "./effects";
import { Ok } from "ts-results";

export class Images {
  private opts: ImagesOpts;

  constructor(opts: Partial<ImagesOpts>) {
    this.opts = {
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

        /** User defined */
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
      hashCacheNames: true,
      logs: false,
      limits: {
        width: 1920,
        height: 1080,
      },
      timeout: 5000,
      customEffects: {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        sepia: (sharp: Sharp, _opts: EffectOpts) => {
          sharp.recomb([
            [0.3588, 0.7044, 0.1368],
            [0.299, 0.587, 0.114],
            [0.2392, 0.4696, 0.0912],
          ]);

          return Ok(201);
        },
      },
      ...opts,
    };
  }

  private async abortStream(
    err: Error,
    controller: AbortController,
    cachePath: CachePathState,
    next: NextFunction,
  ) {
    try {
      controller.abort();

      const exists = await checkCache(cachePath, false);
      if (exists.ok) await unlink(exists.val);

      return next(err);
    } catch (e) {
      return next(e);
    }
  }

  private streamImage(
    candidate: string | void,
    converter: Sharp,
    cache: CacheWriter,
    cachePath: CachePathState,
    res: Response,
    next: NextFunction,
  ) {
    let aborted = false;
    const toId: NodeJS.Timeout = setTimeout(async () => {
      if (!aborted) {
        aborted = true;
        return await this.abortStream(
          new Error("Timed out", { cause: toId }),
          cache.controller,
          cachePath,
          next,
        );
      }
    }, this.opts.timeout);

    converter.on("error", async (err) => {
      if (!aborted) {
        aborted = true;
        clearTimeout(toId);
        return await this.abortStream(err, cache.controller, cachePath, next);
      }
    });

    cache.writer.on("error", async (err) => {
      if (!aborted) {
        aborted = true;
        clearTimeout(toId);
        return await this.abortStream(err, cache.controller, cachePath, next);
      }
    });

    cache.writer.on("close", () => {
      clearTimeout(toId);
    });

    addAbortSignal(cache.controller.signal, converter);

    if (this.opts.logs) console.log("Streaming converted image");

    if (candidate) {
      return createReadStream(candidate)
        .pipe(converter)
        .pipe(cache.writer)
        .pipe(res);
    } else {
      /** Generated images */

      return converter.pipe(cache.writer).pipe(res);
    }
  }

  public async middleware(req: Request, res: Response, next: NextFunction) {
    try {
      const effects = req.query;
      const requestUrl = req.url.split("?")[0];
      const urlInfo = extractUrlInfo(requestUrl, this.opts);

      if (urlInfo.err) return next();

      const absolutePath = join(this.opts.dir, urlInfo.val.path);
      const allowed = allowedSize(urlInfo.val.size, this.opts);

      if (!allowed) {
        const exactMatch = await checkFile(absolutePath, this.opts.logs);
        if (exactMatch.ok) return res.status(200).sendFile(exactMatch.val);

        return next();
      } /** Size not allowed ¿400? */

      const { glob, ext } = globExtension(absolutePath);

      if (ext && !urlInfo.val.ext) {
        const exactMatch = await checkFile(absolutePath, this.opts.logs);
        if (exactMatch.ok) return res.status(200).sendFile(exactMatch.val);

        return next(); /** Format not allowed ¿400? */
      }

      const cachePathState = initCachePathState(
        urlInfo.val.path,
        this.opts,
        urlInfo.val.size,
        urlInfo.val.ext,
      );
      const sharpOptions = getSharpOptions(effects, cachePathState, this.opts);

      let candidate: string | void;

      if (isGeneratedImage(sharpOptions)) {
        if (!urlInfo.val.ext) {
          /** We forcedly need an extension for generated files, raw files are not suported by now */
          return next(
            new Error("An extension is mandatory for generated files.", {
              cause: urlInfo.val,
            }),
          );
        }

        const first = await findFirst(glob);
        if (first.value)
          return next(
            new Error("Existing file generating image.", {
              cause: first.value,
            }),
          );

        if (!this.opts.allowGenerated)
          return next(); /** Generated images not allowed ¿400? */

        candidate = void 0;
      } else {
        const exactMatch = await checkFile(absolutePath, this.opts.logs);
        if (exactMatch.ok) candidate = exactMatch.val;
        else {
          const first = await findFirst(glob);
          candidate = first.value;
        }

        if (!candidate) return res.status(404).send(); /** Not found */
      }

      const converter = convertFile(
        candidate,
        sharpOptions,
        urlInfo.val.size,
        urlInfo.val.ext,
        this.opts,
        effects,
        cachePathState,
      );

      if (converter.err)
        return next(
          new Error("Error converting file.", { cause: converter.val }),
        );

      const cachedFile = await checkCache(cachePathState, this.opts.logs);
      if (cachedFile.ok) return res.status(202).sendFile(cachedFile.val);

      if (candidate && converter.val.code === 200)
        return res
          .status(converter.val.code)
          .sendFile(candidate); /** No change */

      const writer = await getCacheWriter(cachePathState);

      if (writer.err)
        return next(
          new Error("Unable to cache the resulting image.", {
            cause: writer.val,
          }),
        );

      res
        .status(converter.val.code)
        .setHeader("Content-Type", converter.val.mime);

      return this.streamImage(
        candidate,
        converter.val.sharp,
        writer.val,
        cachePathState,
        res,
        next,
      );
    } catch (err) {
      return next(err); /** ¿400? */
    }
  }
}
