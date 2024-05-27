import { stat, mkdir } from "node:fs/promises"
import { resolve } from "node:path"

export const createDirIfNotExists = async (path: string): Promise<void> => {
	const effectivePath = resolve(path);

	try {

		const statResult = await stat(effectivePath);

		if (!statResult.isDirectory())
			throw new Error("Not a directory", { cause: statResult });

	} catch (e) {

		const err = e as any;

		if (err.code !== "ENOENT")
			throw err;

		await mkdir(effectivePath, { recursive: true });

	}
}
