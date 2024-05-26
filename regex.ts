import { ImageSize } from "./types";

export type UrlInfo = {
    dir: string,
    size: ImageSize,
    filename: string,
    ext: string
}

const extractUrlInfo = (url: string, { url: { pattern } }: ImagesOpts): UrlInfo => {

    //To-Do
    
    
}
