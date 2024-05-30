import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as http from "http";
import { setupExpressServer } from './utils/server';
import Images from "../src/images"
import { rmSync } from 'fs';
import { createDirIfNotExists } from '../src/fs';
import { cp } from 'fs/promises';

describe("middleware", () => {
    jest.setTimeout(10000)

    let server: http.Server;

    beforeAll((done) => {

        rmSync(`${__dirname}/images/`, { recursive: true, force: true });

        createDirIfNotExists(`${__dirname}/images/`).then(() => {
            cp(`${__dirname}/original/giraffe.png`, `${__dirname}/images/giraffe.png`).then(() => {
                
                const images = new Images({
                    dir: `${__dirname}/images`,
                    formatOpts: {
                        heif: {
                            compression: 'av1'
                        }
                    }
                });
        
                server = setupExpressServer(images.middleware.bind(images), done);
            });
        });
    })

    it("must succeed", () => {
        expect(true).toBe(true);
    })

    it("must fetch an image", async () => {

        //http://localhost:3000/0x1080/giraffe.jpeg?resize.fit=inside&modulate.hue=180&rotate=120&rotate.background=%23FF0000&affine=1&affine=.3&affine=.1&affine=.7&affine.background=%2300FF00&_rotate=90&flip
        //http://localhost:3000/150x100/giraffe.jpeg?resize.fit=contain&resize.position=left&resize.background=%23FF0000
        //http://localhost:3000/0x1080/test.webp?text.text=<span foreground="red">Red!</span><span background="cyan">blue</span>&text.width=300&text.height=100&text.rgba=true&tint=%2300FF00
        
        const result = await fetch('http://localhost:3000/0x1080/test.webp?text.text=<span foreground="red">Red!</span><span background="cyan">blue</span>&text.width=300&text.height=100&text.rgba=true&tint=%2300FF00')
        const image = await result.blob();

        console.log(image, result.status);

    })

})