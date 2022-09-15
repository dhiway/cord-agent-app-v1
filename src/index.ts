import fs from 'fs';
import express from 'express';
import { createConnection } from 'typeorm';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';

import { app, server } from './server';
import { Init as CordInit, AccountConfiguration } from './cord/init';
import { Record as RecordController } from "./controller/record";
import { Schema as SchemaController } from "./controller/schema";
import { Space as SpaceController } from "./controller/space";

import { dbConfig } from './config/dbconfig';
const {
    PORT,
    STASH_URI,
    SIGNING_URI,
} = process.env;

const STORAGE_DIR = '/tmp/cord-agent';

const spaceRouter = express.Router({ mergeParams: true });
const recordRouter = express.Router({ mergeParams: true });
const schemaRouter = express.Router({ mergeParams: true });

const upload = multer({
    dest: `${STORAGE_DIR}/uploads/`,
    limits: {
        fieldSize: 8 * 1024 * 1024,
    },
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `${STORAGE_DIR}`;
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        } catch (err) {
            console.log('MKDIR failed: ', err);
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(
            null,
            uuidv4().toString() + '_' + file.originalname.replace(' ', '')
        );
    },
});
const upload_bg = multer({ storage: storage });

schemaRouter.get('/', async (req, res) => {
    return await SchemaController.index(req, res);
});

schemaRouter.get('/:id', async (req, res) => {
    return await SchemaController.show(req, res);
});

schemaRouter.post('/', async (req, res) => {
    return await SchemaController.create(req, res);
});

schemaRouter.post('/:id/revoke', async (req, res) => {
    return await SchemaController.revoke(req, res);
});

spaceRouter.get('/', async (req, res) => {
    return await SpaceController.index(req, res);
});

spaceRouter.get('/:id', async (req, res) => {
    return await SpaceController.show(req, res);
});

spaceRouter.post('/', async (req, res) => {
    return await SpaceController.create(req, res);
});

recordRouter.get('/', async (req, res) => {
    return await RecordController.index(req, res);
});

recordRouter.get('/:id', async (req, res) => {
    return await RecordController.show(req, res);
});

recordRouter.delete('/:id', async (req, res) => {
    return await RecordController.delete(req, res);
});

recordRouter.post('/', upload.any(), async (req, res) => {
    return await RecordController.create(req, res);
});

recordRouter.post('/:id/issue', async (req, res) => {
    return await RecordController.commit(req, res);
});

recordRouter.put('/:id', upload.any(), async (req, res) => {
    return await RecordController.update(req, res);
});

recordRouter.post('/:id/revoke', async (req, res) => {
    return await RecordController.revoke(req, res);
});

app.use('/api/v1/schemas', schemaRouter);
app.use('/api/v1/spaces', spaceRouter);
app.use('/api/v1/:spaceId/records', recordRouter);

const openApiDocumentation = JSON.parse(
    fs.readFileSync('./apis.json').toString()
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

// All other routes to React App
app.get('/*', async (req, res) => {
    return res.json({
        message: 'check https://docs.dhiway.com/api for details of the APIs',
    });
});

async function main() {
    if (!PORT) {
        console.log(
            'Environment variable PORT is not set. ' + 'Example PORT=4000'
        );
        return;
    }
    if (!STASH_URI) {
        console.log(
            'Environment variable STASH_URI is not set. ' + 'Example STASH_URI=//Alice'
        );
        return;
    }
    if (!SIGNING_URI) {
        console.log(
            'Environment variable SIGNING_URI is not set. ' + 'Example SIGNING_URI=//Bob'
        );
        return;
    }
    createConnection(dbConfig);
    server.listen(parseInt(PORT, 10), () => {
        console.log(`Dhiway gateway is running at http://localhost:${PORT}`);
    });

    const accountConfiguration: AccountConfiguration = await CordInit.getConfiguration();
    console.log("CORD Initialized");
    console.log('Stash Account - ', accountConfiguration.stashAccount.address);
    console.log('Signing Account - ', accountConfiguration.signingAccount.address);
}

main().catch((e) => console.log(e));
