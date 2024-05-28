import { stat, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { Glob } from "glob";
import { Err, Ok, Result } from "ts-results";
import { ImageSize, ImagesOpts } from "./types";
import { getCachePath } from "./utils";
import { WriteStream, createWriteStream } from "node:fs";

import { Transform, Writable } from "node:stream";
import { close, open, write } from "node:fs";

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

export const checkCache = async (path: string, opts: ImagesOpts, size: ImageSize): Promise<Result<string, Error>> => {

	const cachePath = getCachePath(path, opts, size);
	const effectivePath = resolve(cachePath);

	console.log(`Checking for cached file: ${effectivePath}`);

	try {

		const statResult = await stat(effectivePath);

		if (!statResult.isFile())
			return Err(new Error("Not a file", { cause: statResult }))

		return Ok(effectivePath)

	} catch (err) {

		return Err(new Error("File not found", { cause: err }))

	}
}

export type WriterResult = {
	writer: WriteStream,
	filename: string 
}

export const getCacheWriter = async (path: string, opts: ImagesOpts, size: ImageSize): Promise<Result<WriterResult, Error>> => {

	const cachePath = getCachePath(path, opts, size);
	const cacheDir = dirname(cachePath);
	
	const result = await createDirIfNotExists(cacheDir);

	if (result.err)
		return result;

	const writeable = createWriteStream(cachePath);

	// const cacheWriter = new WriteStream({
	// 	write(chunk, encoding, callback) {
	// 		writeable.write(chunk)
	// 		callback(null);
	// 	},
	// 	destroy(err, cb) {
	// 		console.log("destroy")
	// 		writeable.close()
	// 		cb(err)
	// 	}
	// }); 


/*	const cacheWriter = new Transform({
		transform(chunk, encoding, callback) {
			writeable.write(chunk)
			callback(null, chunk);
		},
		final() {
			console.log("final")
		},
		destroy(err, callback) {
			console.log("destroy")	
		},
		flush(callback) {
			console.log("flush")
			writeable.close(callback)
		}
		
	}); 
	cacheWriter._flush = (cb) => {
		console.log("_flush");
		cb(null);
	} */

	return Ok({ writer: writeable, filename: cachePath });
}