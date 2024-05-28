import { stat, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { Glob } from "glob";
import { Err, Ok, Result } from "ts-results";
import { ImageSize, ImagesOpts } from "./types";
import { getCachePath } from "./utils";
import { createWriteStream } from "node:fs";

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

export const checkCache = async (path: string, opts: ImagesOpts, size: ImageSize): Promise<Result<string, Error>> => {

	const cachePath = getCachePath(path, opts, size);
	const effectivePath = resolve(cachePath);

	try {

		const statResult = await stat(effectivePath);

		if (!statResult.isFile())
			return Err(new Error("Not a file", { cause: statResult }))

		return Ok(effectivePath)

	} catch (err) {

		return Err(new Error("File not found", { cause: err }))

	}
}


class CacheWriter extends Writable {

	private filename: string;
	private fd: number | null;

	constructor(filename: string) {
	  super();
	  this.filename = filename;
	  this.fd = null;
	}
	
	_construct(callback: (arg0?: NodeJS.ErrnoException) => void) {
	  open(this.filename, (err, fd) => {
		if (err) {
		  callback(err);
		} else {
		  this.fd = fd;
		  callback();
		}
	  });
	}

	_write(chunk: Uint8Array, encoding: BufferEncoding, callback: (err: NodeJS.ErrnoException | null, written: number, buffer: Uint8Array) => void) {
	  write(this.fd!, chunk, callback);
	}
	_destroy(err: any, callback: (arg0: any) => void) {
	  if (this.fd) {
		close(this.fd, (er) => callback(er || err));
	  } else {
		callback(err);
	  }
	}
  }

//Promise<Result<(stream: any) =>AsyncGenerator<any, void, unknown>, Error>>
export const getCacheWriter = async (path: string, opts: ImagesOpts, size: ImageSize): Promise<Result<Transform, Error>> => {

	const cachePath = getCachePath(path, opts, size);
	const cacheDir = dirname(cachePath);
	
	const result = await createDirIfNotExists(cacheDir);

	if (result.err)
		return result;

	const writeable = createWriteStream(cachePath);

	const cacheWriter = new Transform({
		transform(chunk, encoding, callback) {
			writeable.write(chunk)
			callback(null, chunk);
		},
	}); 

	cacheWriter.on("end", () => {
		writeable.close()
	})

	return Ok(cacheWriter);

	/* 
	const writeable = createWriteStream(cachePath);

	return Ok(async function* (stream: any) {
		console.log(stream);

		for await (const chunk of stream) {
			console.log(chunk)
			writeable.write(chunk)
			yield chunk;
		}

		writeable.close();
	});
	*/
}