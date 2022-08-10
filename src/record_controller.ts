import express from 'express';
import { getConnection } from 'typeorm';

import { buildAndAnchorStream, anchorStream, revokeStream } from './cord';
import { Schema } from './entity/Schema';
import { Record } from './entity/Record';

export async function recordCreate(
    req: express.Request,
    res: express.Response
) {
    const data = req.body;
    /* format */
    /*
    {
      options: {},
      space: "space:cord:4...",
      schema: "schema:cord:5...",
      content: {
       // fields validated against schema here
      },
      holder?: ...,
    }
    */

    /* only schema gets through the identifier part. */

    /* validation */
    /* TODO: any thing more? */
    if (!data.content || !data.title) {
	res.status(400).json(
	    {
		error: "'content' and 'title' are required fields"
	    }
	);
	return;
    }
    if (!data.schema) {
	res.status(400).json({error: "schema is a required option"});
	return;
    }
    let schema: any = {}
    try {
	let dbschema = await getConnection()
		.getRepository(Schema)
		.createQueryBuilder('schema')
		.where('schema.identity = :id', { id: data.schema })
		.getOne();

	if (!dbschema) {
          res.status(400).json({error: "schema identifier not found"});
	  return;
	}
	schema  = dbschema.cordSchema ? JSON.parse(dbschema.cordSchema) : {};
    } catch (err) {
	res.status(500).json({error: err});
	return;
    }

    let anchor = data.anchor === undefined ? true : !!data.anchor;
    try {
	const response: any = await buildAndAnchorStream(req.params.spaceId, schema, data.content, null, anchor);
	if (response.stream) {
	    /* success */
	    let record = new Record();

	    record.latest = true;
	    record.revoked = false;
	    record.title = data.title;
	    record.identity = response.stream.identifier;
	    record.content = JSON.stringify(data.content);
	    record.cordStreamContent = JSON.stringify(response.contentstream);
	    record.cordStream = JSON.stringify(response.stream);
	    let vc: any = {}
	    if (anchor) {
                record.active = true;
		record.cordBlock = response.block ?? '';
		record.credential = response.credential ? JSON.stringify(response.credential) : '';
		record.vc = response.vc ? JSON.stringify(response.vc) : '';
		vc = response.vc;
	    } else {
	        record.active = false;
	    }
	    await getConnection().manager.save(record);
	    res.json({ result: "SUCCESS", stream: response.stream, vc: vc });
	    return;
	}
	res.status(400).json(
	    {
		error: response.error
	    }
	);
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function recordShow(
    req: express.Request,
    res: express.Response
) {
    try {
	const record = await getConnection()
              .getRepository(Record)
              .createQueryBuilder('record')
              .where('record.identity = :id', { id: req.params.id })
              .andWhere('record.latest = :latest', { latest: true })
              .getOne();

	res.json(record);
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
    
}

export async function recordIndex(
    req: express.Request,
    res: express.Response
) {
    try {
	const schemas = await getConnection()
              .getRepository(Schema)
              .createQueryBuilder('schema')
              .where('record.latest = :latest', { latest: true })
              .where('record.revoked = :revoked', { revoked: false })
              .getMany();

	res.json(schemas);
    } catch (err) {
	res.status(500).json({error: err});
    }
}

export async function recordUpdate(
    req: express.Request,
    res: express.Response
) {
    res.json({error: "Function not implemented"});
}

export async function recordCommit(
    req: express.Request,
    res: express.Response
) {
    try {
	const record = await getConnection()
              .getRepository(Record)
              .createQueryBuilder('record')
              .where('record.identity = :id', { id: req.params.id })
              .andWhere('record.latest = :latest', { latest: true })
              .getOne();

	if (!record) {
	    res.status(404).json({error: "no record found for the identifier"});
	    return;
	}
	const stream = JSON.parse(record.cordStream);
	const sch = await getConnection()
              .getRepository(Schema)
              .createQueryBuilder('schema')
              .where('schema.identity = :id', { id: stream.schema })
              .getOne();

	if (!sch) {
	    res.status(500).json({error: "corrupted record stream"});
	    return;
	}
	const schema = JSON.parse(sch.cordSchema);
	const contentstream = JSON.parse(record.cordStreamContent);
	const response: any = await anchorStream(schema, contentstream, stream);
	if (response.block) {
	    record.active = true;
	    record.cordBlock = response.block ?? '';
	    record.credential = response.credential ? JSON.stringify(response.credential) : '';
	    record.vc = response.vc ? JSON.stringify(response.vc) : '';
	    getConnection().manager.save(record);
	    res.json({ result: "SUCCESS", stream: response.stream, vc: response.vc, block: response.block });
	} else {
	    res.status(500).json({error: response.error});
	}
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function recordRevoke(
    req: express.Request,
    res: express.Response
) {
    try {
	const record = await getConnection()
              .getRepository(Record)
              .createQueryBuilder('record')
              .where('record.identity = :id', { id: req.params.id })
              .andWhere('record.latest = :latest', { latest: true })
              .getOne();

	if (!record) {
	    res.status(404).json({error: "no record found for the identifier"});
	    return;
	}
	const stream = JSON.parse(record.cordStream);
	const response = await revokeStream(stream);
	if (response.block) {
	    record.revoked = true;
	    getConnection().manager.save(record);

	    res.json({result: "SUCCESS", record: req.params.id, block: response.block});
	} else {
	    res.status(500).json({error: response.error});
	}
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function recordDelete(
    req: express.Request,
    res: express.Response
) {
    res.json({error: "Function not implemented"});
}
