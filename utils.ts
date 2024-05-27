import { forIn } from 'lodash'
import { ImageFormat } from 'types'

export const getAllowedExtension = (ext: string, allowedFormats: Set<ImageFormat> | "*"): ImageFormat | null  => {

    if (allowedFormats === "*") {

	/* https://blog.logrocket.com/iterate-over-enums-typescript */
	
	forIn(ImageFormat, (value, key) => {

	    if (isNaN(Number(key))) {
		
		if (value.toString() === ext)
		    return value
		
	    }
	})

	return null;
    }

    const allowed = allowedFormats.find((f) => f.toString() === ext);

    return allowed | null;
}
