import { stat, mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { Glob, GlobOptions } from "glob";
import { Err, Ok, Result } from "ts-results";

export const createDirIfNotExists = async (path: string): Promise<Result<void,Error>> => {
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