import fs from 'fs';
import express from 'express';
import { createConnection } from 'typeorm';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';

import { app, server } from './server';
import { cordInit } from './cord';
import {
    recordIndex,
    recordShow,
    recordCreate,
    recordUpdate,
    recordCommit,
    recordRevoke,
    recordDelete,
} from './record_controller';
import {
    spaceCreate,
    spaceUpdate,
    spaceShow,
    spaceIndex,
} from './space_controller';
import { dbConfig } from './dbconfig';
import {
    schemaIndex,
    schemaShow,
    schemaCreate,
} from './schema_controller';

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
    return await schemaIndex(req, res);
});

schemaRouter.get('/:id', async (req, res) => {
    return await schemaShow(req, res);
});

schemaRouter.post('/', async (req, res) => {
    return await schemaCreate(req, res);
});

spaceRouter.get('/', async (req, res) => {
    return await spaceIndex(req, res);
});

spaceRouter.get('/:id', async (req, res) => {
    return await spaceShow(req, res);
});

spaceRouter.post('/', async (req, res) => {
    return await spaceCreate(req, res);
});

recordRouter.get('/', async (req, res) => {
    return await recordIndex(req, res);
});

recordRouter.get('/:id', async (req, res) => {
    return await recordShow(req, res);
});

recordRouter.delete('/:id', async (req, res) => {
    return await recordDelete(req, res);
});

recordRouter.post('/', upload.any(), async (req, res) => {
    return await recordCreate(req, res);
});

recordRouter.post('/:id/issue', async (req, res) => {
    return await recordCommit(req, res);
});

recordRouter.put('/:id', upload.any(), async (req, res) => {
    return await recordUpdate(req, res);
});

recordRouter.post('/:id/revoke', async (req, res) => {
    return await recordRevoke(req, res);
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
    await cordInit();
}

main().catch((e) => console.log(e));
