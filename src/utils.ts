import { forIn } from 'lodash';
import { ImageFormat, ImageSize, ImagesOpts } from './types';
import { extname, join } from "node:path";
import { Err, Ok, Result } from 'ts-results';

export const getAllowedExtension = (ext: string, allowedFormats: Set<ImageFormat> | "*"): Result<ImageFormat, Error> => {

	if (allowedFormats === "*") {

		/* https://blog.logrocket.com/iterate-over-enums-typescript */

		let found: Result<ImageFormat, Error> = Err(new Error("Unrecognized format", { cause: ext }))

		forIn(ImageFormat, (value, key) => {
			if (isNaN(Number(key)) && found.err) {
				if (value.toString() === ext || ext === "jpg" && value === ImageFormat.JPEG) {
					found = Ok(value);
				}
			}
		});

		return found;
	}

	return allowedFormats.has(ext as ImageFormat) ? 
		Ok(ext as ImageFormat) : 
			ext === "jpg" ? 
			Ok(ImageFormat.JPEG) : 
			Err(new Error("Unrecognized format", { cause: ext }));
}

export const pruneExtension = (ext: string): string => {
	return ext.startsWith(".") ? ext.replace(".", "") : ext;
}

export type GlobExtension = {
	ext: ImageFormat,
	glob: string,
}

export const globExtension = (path: string): GlobExtension => {

	const ext: ImageFormat = pruneExtension(extname(path)) as ImageFormat;

	if (!ext)
		return { ext, glob: `${path}.*` };

	return { ext, glob: path.replace(`.${ext}`, ".*") }
}

export const allowedSize = ([targetWidth, targetHeight]: ImageSize, { limits: { width, height }, allowedSizes }: ImagesOpts): boolean => {

	if (targetWidth && targetWidth > width)
		return false;

	if (targetHeight && targetHeight > height)
		return false;

	if (allowedSizes === "*")
		return true;

	return allowedSizes.has([targetWidth, targetHeight]);
}

export const buildSizeDirectory = ([width, height]: ImageSize): string => {

	if (!width && !height)
		return '';

	let dir = width ? `${width.toString()}x` : 'x';

	if (height)
		dir += height.toString();

	return dir;
}

export const getCachePath = (path: string, { dir }: ImagesOpts, size: ImageSize) => {
	const sizeDir = buildSizeDirectory(size)

	return join(dir, ".cache", sizeDir, path);
}