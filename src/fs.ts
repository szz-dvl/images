import { stat, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { Glob } from "glob";
import { Err, Ok, Result } from "ts-results";
import { CachePathState } from "./utils";
import { createWriteStream } from "node:fs";
import { Transform } from "node:stream";

export const createDirIfNotExists = async (path: string): Promise<Result<void, Error>> => {
	const effectivePath = resolve(path);

	try {

		const statResult = await stat(effectivePath);

		if (!statResult.isDirectory())
			return Err(new Error("Not a directory", { cause: statResult }));

	} catch (e) {

		const err = e as any;

		if (err.code !== "ENOENT")
			return Err(err);

		await mkdir(effectivePath, { recursive: true });

	}

	return Ok.EMPTY
}

export const findFiles = (glob: string): Glob<{}> => {
	return new Glob(glob, {})
}

export const checkFile = async (path: string): Promise<Result<string, Error>> => {

	const effectivePath = resolve(path);

	console.log(`Checking for file: ${effectivePath}`);

	try {

		const statResult = await stat(effectivePath);

		if (!statResult.isFile())
			return Err(new Error("Not a file", { cause: statResult }))

		return Ok(effectivePath)

	} catch (err) {

		return Err(new Error("File not found", { cause: err }))

	}
}

export const checkCache = async (cachePath: CachePathState): Promise<Result<string, Error>> => {

	const effectivePath = resolve(cachePath());

	return checkFile(effectivePath)
	
}

export const getCacheWriter = async (cachePath: CachePathState): Promise<Result<Transform, Error>> => {

	const effectivePath = resolve(cachePath())
	const cacheDir = dirname(effectivePath);
	
	const result = await createDirIfNotExists(cacheDir);

	if (result.err)
		return result;

	const writeable = createWriteStream(effectivePath);

	const cacheWriter = new Transform({
		transform(chunk, encoding, callback) {
			writeable.write(chunk)
			callback(null, chunk);
		},
		final(callback) {
			writeable.close(callback)
		},
	}); 

	return Ok(cacheWriter);
}