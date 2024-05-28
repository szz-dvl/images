import { createReadStream } from "fs";
import { ImageFormat, ImageSize, ImagesOpts } from "./types";
import sharp, { Sharp } from "sharp";
import { Err, Ok, Result } from "ts-results";

export const convertFile = (from: string, size: ImageSize, ext: ImageFormat, { formatOpts }: ImagesOpts): Result<Sharp, Error> => {

    console.log(`Converting file ${from} to ${ext}`);

    if (ext === ImageFormat.SVG) 
        return Err(new Error("Bad target format", { cause: ext }));

    const converter = sharp()
        .resize(...size)

    switch(ext) {
        case ImageFormat.PNG: {
            converter.png(formatOpts?.png)
        }
        break;
        case ImageFormat.AVIF: {
            converter.avif(formatOpts?.avif)
        }
        break;
        case ImageFormat.WEBP: {
            converter.webp(formatOpts?.webp)
        }
        break;
        case ImageFormat.JPEG: {
            converter.jpeg(formatOpts?.jpeg)
        }
        break;
        case ImageFormat.GIF: {
            converter.gif(formatOpts?.gif)
        }
        break;
        case ImageFormat.DZI: {
            converter.tile(formatOpts?.dzi)
        }
        break;
        case ImageFormat.TIFF: {
            converter.tiff(formatOpts?.tiff)
        }
        break;
        case ImageFormat.JP2: {
            converter.jp2(formatOpts?.jp2)
        }
        break;
        case ImageFormat.HEIF: {
            converter.heif(formatOpts?.heif)
        }
        break;
    }

    return Ok(converter);
}