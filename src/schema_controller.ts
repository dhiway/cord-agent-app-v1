import express from 'express';
import { getConnection } from 'typeorm';

import { anchorSchema } from './cord';
import { Schema } from './entity/Schema';

export async function schemaCreate(
    req: express.Request,
    res: express.Response
) {
    const data = req.body;
    /* format */
    /*
    { options: {}, schema: { '$schema', '$metadata', '$id', title, description, properties, required }  }
    */

    /* only schema gets through the identifier part. */

    /* validation */
    /* TODO: any thing more? */
    if (!data.schema || !data.schema.title) {
	res.status(400).json(
	    {
		error: "'schema' is a required field, with title and description"
	    }
	);
	return;
    }

    try {
	const response = await anchorSchema(data.schema);
	if (response.schema) {
	    /* success */
	    const schema = new Schema();
	    schema.title = data.schema.title;
	    schema.identity = response.schema.identifier;
	    schema.content = JSON.stringify(data.schema);
	    schema.cordSchema = JSON.stringify(response.schema);
	    schema.cordBlock = response.block;

            getConnection().manager.save(schema);
	    res.json({ result: "SUCCESS", schema: response.schema.identifier });
	    return;
	}
	res.status(400).json({ error: response.error });
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function schemaShow(
    req: express.Request,
    res: express.Response
) {
    try {
	const schema = await getConnection()
              .getRepository(Schema)
              .createQueryBuilder('schema')
              .where('schema.identity = :id', { id: req.params.id })
              .getOne();

	res.json(schema);
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function schemaIndex(
    req: express.Request,
    res: express.Response
) {
    try {
	const schemas = await getConnection()
              .getRepository(Schema)
              .createQueryBuilder('schema')
              .getMany();

	res.json(schemas);
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}
