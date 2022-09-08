import express from 'express';
import { getConnection } from 'typeorm';

import { anchorSpace } from './cord';
import { Space } from './entity/Space';

export async function spaceCreate(
    req: express.Request,
    res: express.Response
) {

    const data = req.body;
    /* format */
    /*
    { options: {}, schema: "schema:cord:5xxxx..", space: { id?, title, description } }
    */

    /* only space gets through the identifier part. 'id' is optional, but
       recommended to keep the uniqueness in identifer creation */

    /* validation */
    /* TODO: any thing more? */
    if (!data.space) {
	res.status(400).json(
	    {
		error: "'space' is a required field, with title and description"
	    }
	);
	return;
    }

    try {
	const response = await anchorSpace(data.schema, data.space);
	if (response.space) {
	    /* success */
	    let space = new Space();
	    space.title = data.space.title;
	    space.identity = response.space?.identifier?.replace('space:cord:','');
	    space.content = JSON.stringify(data.space);
	    space.cordSpace = JSON.stringify(response.space);
	    space.cordBlock = response.block;
	    space.schema = data.schema ? data.schema : '';
            await getConnection().manager.save(space);
	    res.json({ result: "SUCCESS", space: response.space?.identifier });
	} else {
            res.status(400).json(
		{
		    error: response.error
		}
	    );
	}
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function spaceShow(
    req: express.Request,
    res: express.Response
) {
    try {
	const space = await getConnection()
              .getRepository(Space)
              .createQueryBuilder('space')
              .where('space.identity = :id', { id: req.params.id?.replace('space:cord:','') })
              .getOne();

	res.json(space);
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function spaceIndex(
    req: express.Request,
    res: express.Response
) {
    try {
	const spaces = await getConnection()
              .getRepository(Space)
              .createQueryBuilder('space')
              .getMany();

	res.json(spaces);
    } catch (err) {
	res.status(500).json({error: err});
    }
    return;
}

export async function spaceUpdate(
    req: express.Request,
    res: express.Response
) {
    res.status(400).json({error: "Function not implemented"});
}
