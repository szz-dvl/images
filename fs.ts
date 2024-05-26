import { stat } from "node:fs/promises"
import { resolve } from "node:path"

export const createDirIfNotExists: Promise<void> = async (path: string) => {
    const effectivePath = resolve(path);

    try {

	const statResult = await stat(effectivePath);

	if (!statResult.isDirectory())
	    throw new Error("Not a directory", cause: statResult)
	
    } catch(err) {

	if (err.code !== "ENOENT")
	    throw err;
	
	await mkdir(effectivePath, { recursive: true });
	
    }
}
