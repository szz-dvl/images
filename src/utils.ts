import { forIn } from 'lodash';
import { ImageFormat } from './types';

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
