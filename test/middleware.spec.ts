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
                })
        
                server = setupExpressServer(images.middleware.bind(images), done);
            });
        });
    })

    it("must succeed", () => {
        expect(true).toBe(true);
    })

    it("must fetch an image", async () => {
        
        const result = await fetch("http://localhost:3000/0x50/giraffe.png")
        const image = await result.blob();

        console.log(image, result.status);

    })

})