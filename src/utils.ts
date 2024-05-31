import { forIn } from 'lodash';
import { ImageSize, ImagesOpts } from './types';
import { ImageFormat, ImageKnownExtensions, ImageMimeType, SharpBooleanKeys, SharpDuplicatedNaming } from "./constants";
import { basename, dirname, extname, join } from "node:path";
import { Err, Ok, Result } from 'ts-results';
import { SharpOptions } from 'sharp';
import md5 from "md5";

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

export const buildSizeDirectory = ([width, height]: ImageSize): string => {

	if (!width && !height)
		return '';

	let dir = width ? `${width.toString()}x` : 'x';

	if (height)
		dir += height.toString();

	return dir;
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

export const serializeEffect = (effectKey: string, effectValue: string, hashCacheNames: boolean): string => {

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

	return hashCacheNames ? `${effectiveKey}=${effectiveValue}` : `${effectiveKey}=${effectiveValue}`.replaceAll("\/", "|")

}

const getEffectsSuffix = (parts: Array<string>, hashCacheNames: boolean): string => {

	parts.sort();

	return parts.length ? ":" + (hashCacheNames ? md5(parts.join("-")) : parts.join("-")) : '';

}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type CachePathState = (piece?: Record<string, any>, updatExt?: ImageFormat) => string;

export const initCachePathState = (path: string, { dir, hashCacheNames }: ImagesOpts, size: ImageSize, ext: ImageFormat | null): CachePathState => {

	const sizeDir = buildSizeDirectory(size);
	const requestedExt = extname(path);
	const file = basename(path);
	const filename = file.replace(requestedExt, '');
	const pathDir = dirname(path);
	const parts: Array<string> = [];

	const cachePath = join(dir, ".cache", sizeDir, pathDir, filename);

	return (piece?: Record<string, any>, updateExt?: ImageFormat): string => {

		if (updateExt) {

			ext = updateExt;

			return cachePath + `.${ext}`;
		}


		if (piece) {

			for (const effect in piece) {
				const effectValue = piece[effect];
				parts.push(serializeEffect(effect, effectValue, hashCacheNames));
			}

			return cachePath + `.${ext}`;
		}

		return cachePath + getEffectsSuffix(parts, hashCacheNames) + `.${ext}`;
	}
}