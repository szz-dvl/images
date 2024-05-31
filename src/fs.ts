import { stat, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Glob } from "glob";
import { Err, Ok, Result } from "ts-results";
import { CachePathState } from "./utils";
import { createWriteStream } from "node:fs";
import { Transform, addAbortSignal } from "node:stream";

export const createDirIfNotExists = async (
  path: string,
): Promise<Result<void, Error>> => {
  const effectivePath = resolve(path);

  try {
    const statResult = await stat(effectivePath);

    if (!statResult.isDirectory())
      return Err(new Error("Not a directory", { cause: statResult }));
  } catch (e) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const err = e as any;

    if (err.code !== "ENOENT") return Err(err);

    await mkdir(effectivePath, { recursive: true });
  }

  return Ok.EMPTY;
};

export const findFirst = async (glob: string): Promise<IteratorResult<string, void>> => {
  return await new Glob(glob, {}).iterate().next();
};

export const checkFile = async (
  path: string,
  logs: boolean,
): Promise<Result<string, Error>> => {
  const effectivePath = resolve(path);

  if (logs) console.log(`Checking for file: ${effectivePath}`);

  try {
    const statResult = await stat(effectivePath);

    if (!statResult.isFile())
      return Err(new Error("Not a file", { cause: statResult }));

    return Ok(effectivePath);
  } catch (err) {
    return Err(new Error("File not found", { cause: err }));
  }
};

export const checkCache = async (
  cachePath: CachePathState,
  logs: boolean,
): Promise<Result<string, Error>> => {
  const effectivePath = resolve(cachePath());

  return checkFile(effectivePath, logs);
};

export type CacheWriter = {
  writer: Transform;
  controller: AbortController;
};

export const getCacheWriter = async (
  cachePath: CachePathState,
): Promise<Result<CacheWriter, Error>> => {
  const effectivePath = resolve(cachePath());
  const cacheDir = dirname(effectivePath);

  const result = await createDirIfNotExists(cacheDir);

  if (result.err) return result;

  const writeable = createWriteStream(effectivePath);
  const controller = new AbortController();

  addAbortSignal(controller.signal, writeable);

  const cacheWriter = new Transform({
    transform(chunk, encoding, callback) {
      writeable.write(chunk);
      callback(null, chunk);
    },
    final(callback) {
      writeable.close(callback);
    },
    signal: controller.signal,
  });

  return Ok({ writer: cacheWriter, controller });
};
