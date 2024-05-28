import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as http from "http";
import { setupExpressServer } from './utils/server';
import Images from "../src/images"
import { rmSync } from 'fs';

describe("middleware", () => {
    jest.setTimeout(10000)

    let server: http.Server;

    beforeAll((done) => {

        rmSync(`${__dirname}/images/.cache`, { recursive: true, force: true });

        const images = new Images({
            dir: `${__dirname}/images`,
            formatOpts: {
                heif: {
                    compression: 'av1'
                }
            }
        })

        server = setupExpressServer(images.middleware.bind(images), done);
    })

    it("must succeed", () => {
        expect(true).toBe(true);
    })

    it("must fetch an image", async () => {
        
        const result = await fetch("http://localhost:3000/0x0/giraffe.heif")
        const image = await result.blob();

        console.log(image, result.status);


    })

})