import { forIn } from 'lodash';
import { ImageSize, ImagesOpts } from './types';
import { ImageEffect, ImageFormat, ImageKnownExtensions, ImageMimeType, SharpBooleanKeys, SharpDuplicatedNaming } from "./constants";
import { basename, dirname, extname, join } from "node:path";
import { Err, Ok, Result } from 'ts-results';
import { ParsedQs } from "qs"
import { SharpOptions } from 'sharp';

export const isKnownExtension = (ext: string, current: ImageFormat) => {
	return ImageKnownExtensions[current].includes(ext)
}

export const getAllowedExtension = (ext: string, allowedFormats: Set<ImageFormat> | "*"): Result<ImageFormat, Error> => {

	if (allowedFormats === "*") {

		/* https://blog.logrocket.com/iterate-over-enums-typescript */

		let found: Result<ImageFormat, Error> = Err(new Error("Unrecognized format", { cause: ext }))

		forIn(ImageFormat, (value, key) => {
			if (isNaN(Number(key)) && found.err) {
				if (isKnownExtension(ext, value)) {
					found = Ok(value);
				}
			}
		});

		return found;
	}

	for (const allowed of allowedFormats) {
		if (isKnownExtension(ext, allowed))
			return Ok(allowed)
	}

	return Err(new Error("Unrecognized format", { cause: ext }));
}

export const pruneExtension = (ext: string): string => {
	return ext.startsWith(".") ? ext.replace(".", "") : ext;
}

export type GlobExtension = {
	ext: string,
	glob: string,
}

export const globExtension = (path: string): GlobExtension => {

	const ext = pruneExtension(extname(path));

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

export const buildEffectsSuffix = (effects: ParsedQs) => {

	let suffix = ":";

	for (const effect in effects) {
		const effectValue = effects[effect];
		suffix += `${effect}=${effectValue}-`;
	}

	return suffix.substring(0, suffix.length - 1)
}

export const buildSizeDirectory = ([width, height]: ImageSize): string => {

	if (!width && !height)
		return '';

	let dir = width ? `${width.toString()}x` : 'x';

	if (height)
		dir += height.toString();

	return dir;
}

export const getCachePath = (path: string, { dir }: ImagesOpts, size: ImageSize, effects: ParsedQs): string => {
	const sizeDir = buildSizeDirectory(size)
	const effectsSuffix = buildEffectsSuffix(effects).replaceAll("\/", "|")

	const ext = extname(path);
	const file = basename(path);
	const filename = file.replace(ext, '')
	const pathDir = dirname(path)

	return join(dir, ".cache", sizeDir, pathDir, filename + effectsSuffix + ext);
}

export const getFormatMimeType = (ext: ImageFormat | null): ImageMimeType => {

	switch (ext) {
		case ImageFormat.PNG: {
			return ImageMimeType.PNG;
		}
		case ImageFormat.AVIF: {
			return ImageMimeType.AVIF;
		};
		case ImageFormat.WEBP: {
			return ImageMimeType.WEBP;
		}
		case ImageFormat.JPEG: {
			return ImageMimeType.JPEG;
		}
		case ImageFormat.GIF: {
			return ImageMimeType.GIF;
		}
		case ImageFormat.TIFF: {
			return ImageMimeType.TIFF;
		}
		case ImageFormat.JP2: {
			return ImageMimeType.JP2;
		}
		case ImageFormat.HEIF: {
			return ImageMimeType.HEIF;
		}
	}

	return ImageMimeType.ANY;

}

export const isGeneratedImage = ({ text, create }: SharpOptions) => {
	return !!text || !!create
}

export const serializeEffect = (effectKey: string, effectValue: string): string => {

	let effectiveKey = effectKey,
		effectiveValue = effectValue;

	for (const duplicated in SharpDuplicatedNaming) {

		if ((<Record<string, string[]>>SharpDuplicatedNaming)[duplicated].includes(effectiveKey)) {
			effectiveKey = duplicated
		}

		if (SharpBooleanKeys.includes(effectiveKey)) {
			effectiveValue = effectiveValue === "false" ? effectiveValue : "true";
		}
	}

	return `${effectiveKey}=${effectiveValue}-`.replaceAll("\/", "|")

}

export type CachePathState = (piece?: Record<string, any>, updatExt?: ImageFormat) => string;

export const initCachePathState = (path: string, { dir }: ImagesOpts, size: ImageSize, ext: ImageFormat | null): CachePathState => {

	const sizeDir = buildSizeDirectory(size);
	const requestedExt = extname(path);
	const file = basename(path);
	const filename = file.replace(requestedExt, '');
	const pathDir = dirname(path);

	let consumed = false;
	let cachePath = join(dir, ".cache", sizeDir, pathDir, filename + ":");

	return (piece?: Record<string, any>, updateExt?: ImageFormat): string => {

		if (updateExt) {

			ext = updateExt;

			return cachePath.substring(0, cachePath.length - 1) + `.${ext}`;
		}


		if (piece) {

			for (const effect in piece) {
				const effectValue = piece[effect];
				cachePath += serializeEffect(effect, effectValue);
			}

			consumed = false;

			return cachePath.substring(0, cachePath.length - 1) + `.${ext}`;
		}

		if (!consumed) {
			cachePath = cachePath.substring(0, cachePath.length - 1);
			consumed = true;
		}

		return cachePath + `.${ext}`;
	}
}