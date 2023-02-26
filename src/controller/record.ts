import express from "express";
import { getConnection } from "typeorm";

import * as Cord from '@cord.network/sdk';
import * as VCUtils from '@cord.network/vc-export';

import { Stream as StreamCord } from "../cord/stream";
import { Record as RecordEntity } from "../entity/Record";
import { Schema as SchemaEntity } from "../entity/Schema";

/*
const { EcdsaSecp256k1KeyClass2019,
		   EcdsaSecp256k1Signature2019,
		   defaultDocumentLoader} = require('@transmute/lds-ecdsa-secp256k1-2019');
*/

export class Record {
  public static async create(req: express.Request, res: express.Response) {
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
      res.status(400).json({
        error: "'content' and 'title' are required fields",
      });
      return;
    }

    if (!data.schema) {
      res.status(400).json({ error: "schema is a required option" });
      return;
    }

    let schema: any = {};
    try {
      let dbschema = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .where("schema.identity = :id", {
          id: data.schema?.replace("schema:cord:", ""),
        })
        .getOne();

      if (!dbschema) {
        res.status(400).json({ error: "schema identifier not found" });
        return;
      }
      schema = dbschema.cordSchema ? JSON.parse(dbschema.cordSchema) : {};
    } catch (err) {
      res.status(500).json({ error: err });
      return;
    }

    const anchor = data.anchor === undefined ? true : !!data.anchor;

    try {
      const spaceId = req.params.spaceId.includes("space:cord:")
        ? req.params.spaceId
        : `space:cord:${req.params.spaceId}`;

      const response: any = await StreamCord.buildAndAnchor(
        spaceId,
        schema,
        data.content,
        null,
        anchor
      );

      if (response.stream) {
        /* success */
        let record = new RecordEntity();
        record.latest = true;
        record.revoked = false;
        record.title = data.title;
        record.identity = response.stream.identifier;
        record.content = JSON.stringify(data.content);
        record.cordStreamContent = JSON.stringify(response.contentstream);
        record.cordStream = JSON.stringify(response.stream);

        let vc: any = {};

        if (anchor) {
          record.active = true;
          record.cordBlock = response.block ?? "";
          record.credential = response.credential
            ? JSON.stringify(response.credential)
            : "";
          record.vc = response.vc ? JSON.stringify(response.vc) : "";
          vc = response.vc;
        } else {
          record.active = false;
        }

        await getConnection().manager.save(record);
        res.json({ result: "SUCCESS", stream: response.stream, vc: vc });
      } else {
        res.status(400).json({
          error: response.error,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async show(req: express.Request, res: express.Response) {
    try {
      const record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      /* Also send history of all records with identifier */
      let history: any;
      if (record) {
        history = await getConnection()
          .getRepository(RecordEntity)
          .createQueryBuilder("record")
          .select([
            "record.id",
            "record.cordBlock",
            "record.credential",
            "record.createdAt",
            "record.updatedAt",
          ])
          .where("record.identity = :id", { id: req.params.id })
          .orderBy("record.createdAt", "ASC")
          .getMany();
      }

      res.json({ ...record, history: history });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async index(req: express.Request, res: express.Response) {
    try {
      const records = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.latest = :latest", { latest: true })
        .where("record.revoked = :revoked", { revoked: false })
        .getMany();

      res.json(records);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async revoke(req: express.Request, res: express.Response) {
    try {
      const record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      if (!record) {
        res.status(404).json({ error: "no record found for the identifier" });
        return;
      }

      const stream = JSON.parse(record.cordStream);
      const response = await StreamCord.revoke(stream);

      if (response.block) {
        record.revoked = true;
        getConnection().manager.save(record);

        res.json({
          result: "SUCCESS",
          record: req.params.id,
          block: response.block,
        });
      } else {
        res.status(500).json({ error: response.error });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async commit(req: express.Request, res: express.Response) {
    try {
      const record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      if (!record) {
        res.status(404).json({ error: "no record found for the identifier" });
        return;
      }
      const stream = JSON.parse(record.cordStream);
      const sch = await getConnection()
        .getRepository(SchemaEntity)
        .createQueryBuilder("schema")
        .where("schema.identity = :id", { id: stream.schema })
        .getOne();

      if (!sch) {
        res.status(500).json({ error: "corrupted record stream" });
        return;
      }
      const schema = JSON.parse(sch.cordSchema);
      const contentstream = JSON.parse(record.cordStreamContent);
      const response: any = await StreamCord.anchor(
        schema,
        contentstream,
        stream
      );
      if (response.block) {
        record.active = true;
        record.cordBlock = response.block ?? "";
        record.credential = response.credential
          ? JSON.stringify(response.credential)
          : "";
        record.vc = response.vc ? JSON.stringify(response.vc) : "";
        getConnection().manager.save(record);
        res.json({
          result: "SUCCESS",
          stream: response.stream,
          vc: response.vc,
          block: response.block,
        });
      } else {
        res.status(500).json({ error: response.error });
      }
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static async update(req: express.Request, res: express.Response) {
    try {
      let record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      if (!record) {
        return res.status(404).json({ error: "Identifier not found" });
      }

      const data = req.body;
      const content = JSON.parse(record.cordStreamContent);

      const response = await StreamCord.update(
        record.identity,
        content,
        data.content
      );
      if (response.block) {
        /* Success */
        let newrecord = new RecordEntity();

        record.latest = false;
        record.active = false;
        newrecord.latest = true;
        newrecord.revoked = false;
        newrecord.title = data.title;
        newrecord.identity = response.stream.identifier;
        newrecord.content = JSON.stringify(data.content);
        newrecord.cordStreamContent = JSON.stringify(response.contentstream);
        newrecord.cordStream = JSON.stringify(response.stream);
        newrecord.active = true;
        newrecord.cordBlock = response.block ?? "";
        newrecord.credential = response.credential
          ? JSON.stringify(response.credential)
          : "";
        newrecord.vc = response.vc ? JSON.stringify(response.vc) : "";
        await getConnection().manager.save(newrecord);
        await getConnection().manager.save(record);
        res.json({ result: "SUCCESS", stream: response.stream, vc: undefined });
      } else {
        return res.status(500).json({ error: "failed to update on the chain" });
      }
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  public static async verify(req: express.Request, res: express.Response) {
    let data = req.body;

    /* data as part of VC */
    const vc = data.vc;

    const id = vc?.id;
    if (!id) {
       return res.status(400).json({error: "Identity of VC missing"});
    }

    let digestResult: any = false;
    let streamResult: any = false;
    let streamSignatureResult: any = false;

    for (let i = 0; i < vc?.proof?.length ?? 0; i++) {
    	const p = vc.proof[i];
	if (p.type === VCUtils.constants.CORD_STREAM_SIGNATURE_PROOF_TYPE) {
	    streamSignatureResult =
		await VCUtils.verification.verifyStreamSignatureProof(vc, p);
	}
    
	if (p.type === VCUtils.constants.CORD_ANCHORED_PROOF_TYPE) {
	    streamResult = await VCUtils.verification.verifyStreamProof(vc, p);
	}

	if (p.type === VCUtils.constants.CORD_CREDENTIAL_DIGEST_PROOF_TYPE) {
	    digestResult = await VCUtils.verification.verifyCredentialDigestProof(vc, p);
	}
    }
    return res.status(200).json({
       signature: streamSignatureResult,
       stream: streamResult,
       digest: digestResult,
    });
  }

  public static async verifyVp(req: express.Request, res: express.Response) {
    let data = req.body;

      /* data as part of VC */
      const vp = data.vp;
      const vcChallenge = data.challenge;

      const holder = vp?.holder;
      if (!holder) {
	  return res.status(400).json({error: "Holder Identity of VP missing"});
      }

      let response: any[] = [];
      let vcs = vp.verifiableCredential;

      const selfSignatureResult =
	    await VCUtils.verification.verifySelfSignatureProof(
		vcs[0],
		vp.proof[0],
		vcChallenge
	    );

      for (let j = 0; j < vcs?.length ?? 1; j++) {
    	  const vc = vcs[j] ?? vcs;
	  let digestResult: any = false;
	  let streamResult: any = false;
	  let streamSignatureResult: any = false;
	  for (let i = 0; i < vc?.proof?.length ?? 0; i++) {
    	      const p = vc.proof[i];
	      if (p.type === VCUtils.constants.CORD_STREAM_SIGNATURE_PROOF_TYPE) {
		  streamSignatureResult =
		      await VCUtils.verification.verifyStreamSignatureProof(vc, p);
	      }
    
	      if (p.type === VCUtils.constants.CORD_ANCHORED_PROOF_TYPE) {
		  streamResult = await VCUtils.verification.verifyStreamProof(vc, p);
	      }

	      if (p.type === VCUtils.constants.CORD_CREDENTIAL_DIGEST_PROOF_TYPE) {
		  digestResult = await VCUtils.verification.verifyCredentialDigestProof(vc, p);
	      }
	  }
	  response.push({
	      vc: vc.id,
	      signature: streamSignatureResult,
	      stream: streamResult,
	      digest: digestResult,
	  })
      }
      return res.status(200).json({response, selfSignatureResult});
  }

  public static async verifyVc(req: express.Request, res: express.Response) {
      let data = req.body;

      const vcjs = await import('@digitalbazaar/vc');

      /* data as part of VC */
      const credential = data.vc;

      let result: any = {};
      // Required to set up a suite instance with private key
      /*
      {
      const ed = await import('@digitalbazaar/ed25519-verification-key-2018');
      const eds = await import('@digitalbazaar/ed25519-signature-2018');

      const keyPair = await ed.Ed25519VerificationKey2018.generate();

      const suite = new eds.Ed25519Signature2018({key: keyPair});
       result = await vcjs.verifyCredential({credential: credential, suite, documentLoader: vcjs.defaultDocumentLoader});
      }
      */

      /* (2020) */
	{
	const ed = await import('@digitalbazaar/ed25519-verification-key-2018');
	const eds = await import('@digitalbazaar/ed25519-signature-2018');
	
	const keyPair = await ed.Ed25519VerificationKey2018.generate();
	
	const suite = new eds.Ed25519Signature2018({key: keyPair});
      result = await vcjs.verifyCredential({credential: credential, suite, documentLoader: vcjs.defaultDocumentLoader});
	}

	/*

      {
	  const key = new EcdsaSecp256k1KeyClass2019({
	      id:
	      'did:elem:EiChaglAoJaBq7bGWp6bA5PAQKaOTzVHVXIlJqyQbljfmg#qfknmVDhMi3Uc190IHBRfBRqMgbEEBRzWOj1E9EmzwM',
	      controller: 'did:elem:EiChaglAoJaBq7bGWp6bA5PAQKaOTzVHVXIlJqyQbljfmg',
	      privateKeyJwk: {
		  kty: 'EC',
		  crv: 'secp256k1',
		  d: 'wNZx20zCHoOehqaBOFsdLELabfv8sX0612PnuAiyc-g',
		  x: 'NbASvplLIO_XTzP9R69a3MuqOO0DQw2LGnhJjirpd4w',
		  y: 'EiZOvo9JWPz1yGlNNW66IV8uA44EQP_Yv_E7OZl1NG0',
		  kid: 'qfknmVDhMi3Uc190IHBRfBRqMgbEEBRzWOj1E9EmzwM',
	      },
	  });
	  
	  const suite = new EcdsaSecp256k1Signature2019({
	      key,
	  });
	  
          result = await vcjs.verifyCredential({credential: credential, suite, documentLoader: defaultDocumentLoader});
      }
      */
      console.log("Result : ", result);
      return res.status(200).json({
	  result
      });
  }

  public static async delete(req: express.Request, res: express.Response) {
    try {
      let record = await getConnection()
        .getRepository(RecordEntity)
        .createQueryBuilder("record")
        .where("record.identity = :id", { id: req.params.id })
        .andWhere("record.latest = :latest", { latest: true })
        .getOne();

      if (!record) {
        return res.status(404).json({ error: "Identifier not found" });
      }

      if (record.active) {
        return res.status(404).json({ error: "Record is anchored" });
      }

      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(RecordEntity)
        .where("record.identity = :id", { id: req.params.id })
        .execute();
      return res.status(200).json({ result: "SUCCESS" });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
}
