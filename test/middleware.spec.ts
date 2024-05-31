import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as http from "http";
import { setupExpressServer } from './utils/server';
import { Images } from "../src/images"
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
                    allowGenerated: true,
                    formatOpts: {
                        heif: {
                            compression: 'av1',
                        }
                    }
                });
        
                server = setupExpressServer(images.middleware.bind(images), done);
            });
        });
    })

    afterAll(() => {
        server.close()
    })

    it("must succeed", () => {
        expect(true).toBe(true);
    })

    it("must create a cool image", async () => {

        const result = await fetch('http://localhost:3000/0x1080/giraffe.avif?resize.fit=inside&modulate.hue=180&rotate=120&rotate.background=%23FF0000&affine=1&affine=.3&affine=.1&affine=.7&affine.background=%2300FF00&flip')
        
        expect(result.status).toBe(201);

    })

    it("must recover an image from the cache", async () => {

        await fetch('http://localhost:3000/150x100/giraffe.jpeg?resize.fit=contain&resize.position=left&resize.background=%23FF0000')
        const result = await fetch('http://localhost:3000/150x100/giraffe.jpeg?resize.fit=contain&resize.position=left&resize.background=%23FF0000')
        
        expect(result.status).toBe(202);

    })

    it("must return the original image", async () => {

        const result = await fetch('http://localhost:3000/0x0/giraffe.png')
        
        expect(result.status).toBe(200);

    })

    it("must generate an image from text", async () => {

        const result = await fetch('http://localhost:3000/850x350/test.webp?text.text=<span foreground="red" size="xx-large">szz</span><span background="cyan" size="xx-small">software</span>&text.height=250&text.width=250&text.rgba=true&tint=%2300FF00&resize.fit=fill')
        
        expect(result.status).toBe(201);

    })
})