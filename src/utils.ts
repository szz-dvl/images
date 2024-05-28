import { forIn } from 'lodash';
import { ImageFormat, ImageSize, ImagesOpts } from './types';
import { extname } from "node:path";

export const getAllowedExtension = (ext: string, allowedFormats: Set<ImageFormat> | "*"): ImageFormat | null => {

	if (allowedFormats === "*") {

		/* https://blog.logrocket.com/iterate-over-enums-typescript */

		let found: ImageFormat | null = null

		forIn(ImageFormat, (value, key) => {
			if (isNaN(Number(key)) && !found) {
				if (value.toString() === ext || ext === "jpg" && value === ImageFormat.JPEG) {
					found = value;
				}
			}
		});

		return found;
	}

	return allowedFormats.has(ext as ImageFormat) ? ext as ImageFormat : ext === "jpg" ? ImageFormat.JPEG : null;
}

export const pruneExtension = (ext: string) => {
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

	return { ext, glob: path.replace(ext, ".*") }
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