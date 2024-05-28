import * as http from "http";
import express, { RequestHandler } from 'express';

export const setupExpressServer = (middleware: RequestHandler, done: () => void): http.Server => {
    const app = express()
    const port = Number(process.env.PORT) || 3000

    app.use(middleware);

    return app.listen(port, () => {
        console.log(`Testing app listening on port ${port}`)
        done();
    })
}

