/* eslint-disable no-unused-vars */
import * as Cord from '@cord.network/sdk';
//import * as VCUtils from '@cord.network/vc-export';
import BN from 'bn.js';

const { CORD_WSS_URL, STASH_URI, SIGNING_URI } = process.env;

const cordUrl = CORD_WSS_URL ? CORD_WSS_URL : 'ws://localhost:9944';
let stash_acc: any | null = null;
let signing_acc: any | null = null;
let cordInitDone: boolean = false;

export async function cordInit() {
    await Cord.init({ address: cordUrl });

    stash_acc = Cord.Identity.buildFromURI(STASH_URI, {
        signingKeyPairType: 'sr25519',
    });

    signing_acc = Cord.Identity.buildFromURI(SIGNING_URI, {
        signingKeyPairType: 'sr25519',
    });

    console.log('CORD Initialization complete');
    console.log('Stash Account - ', stash_acc.address);
    console.log('Signing Account - ', signing_acc.address);

    cordInitDone = true;
}

export async function transferFunds(destAddress: string, tokens: number) {
    if (!cordInitDone) {
        await cordInit();
    }
    //const MINIMUM_TOKENS = '100,100,000,000,000'; //100_100_000_000_000
    if (!tokens) {
        tokens = 100;
    }
    const token = tokens / 20;
    const bn_amount = new BN(`${token}0000000000000000`, 10);
    /* it takes roughly 0.009 WAY for one anchoring now on v1 chain. Hence,
       instead of divide by 100, lets do it as 20, so every paid customer gets some
       extra tokens too. */
    /* 18 zeros here for WAY having 18 decimal entries, send as many WAYs as asked in token */
    try {
        const extrinsic = await Cord.Balance.makeTransfer(
            destAddress,
            bn_amount
        );

        const tx = await Cord.Chain.signAndSubmitTx(
	    extrinsic,
	    stash_acc,
	    {
		resolveOn: Cord.Chain.IS_IN_BLOCK,
		rejectOn: Cord.Chain.IS_ERROR,
            }
	);
        return true;
    } catch (err) {
        console.log('Failed to transfer funds', err);
    }
    return false;
}

export async function anchorSchema(
    schema: any
) {
    if (!cordInitDone) {
        await cordInit();
    }

    let org_acc = signing_acc;
    try {
        const newSchema = Cord.Schema.fromSchemaProperties(
            schema,
            org_acc
        );
        const schemaCreationExtrinsic = await Cord.Schema.create(newSchema);
        const tx = await Cord.Chain.signAndSubmitTx(
            schemaCreationExtrinsic,
            org_acc,
            {
                resolveOn: Cord.Chain.IS_IN_BLOCK,
                rejectOn: Cord.Chain.IS_ERROR,
            }
        );
	const block = tx.status.asInBlock ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock) : '';
        return { tx: tx, schema: newSchema, block: block };
    } catch (e: any) {
        console.log(e.errorCode, '-', e.message);
        return { error: e.message }
    }
}

export async function anchorSpace(
    schemaId: string | null,
    space: any,
) {
    if (!cordInitDone) {
        await cordInit();
    }

    let org_acc = signing_acc;
    if (!space) {
        return { error: 'not a valid space' };
    }

    let spaceContent = { ...space };
    try {
        let newSpace = Cord.Space.fromSpaceProperties(spaceContent, org_acc, schemaId);
        let spaceCreationExtrinsic = await Cord.Space.create(newSpace);
        const tx = await Cord.Chain.signAndSubmitTx(
            spaceCreationExtrinsic,
            org_acc,
            {
                resolveOn: Cord.Chain.IS_IN_BLOCK,
                rejectOn: Cord.Chain.IS_ERROR,
            }
        );
	let block = tx.status.asInBlock ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock) : '';
        return { tx: tx, space: newSpace, block: block };
    } catch (e: any) {
        console.log(e.errorCode, '-', e.message);
        return { error: e.message };
    }
}


export async function buildAndAnchorStream(
    spaceId: any,
    schema: any,
    content: any,
    holderAddress: string | null,
    anchor: boolean,
) {
    if (!cordInitDone) {
        await cordInit();
    }

    let org_acc = signing_acc;
    let tx: any = undefined;
    if (!holderAddress) {
	console.log("Holder Address not provided, issuing it to self");
	holderAddress = org_acc.address;
    }
    try {
        /* assumption is space and schema are created by now */
        let schemaStream = Cord.Content.fromSchemaAndContent(
            schema,
            content,
            org_acc.address,
            holderAddress
        );
        let newStreamContent = Cord.ContentStream.fromContent(
            schemaStream,
            org_acc,
            { space: spaceId }
        );
        let newStream = Cord.Stream.fromContentStream(newStreamContent);

	if (anchor) {
	    return await anchorStream(schema, newStreamContent, newStream);
	} else {
	    return {
		block: null,
		stream: newStream,
		contentstream: newStreamContent
	    };
	}
    } catch (e: any) {
        console.log(e.errorCode, '-', e.message);
        return { error: e.message };
    }
}

export async function anchorStream(
    schema: any,
    contentstream: any,
    stream: any
) {
    if (!cordInitDone) {
        await cordInit();
    }

    const org_acc = signing_acc;
    const streamCreationExtrinsic = await Cord.Stream.create(stream);
    try {
	const tx = await Cord.Chain.signAndSubmitTx(
	    streamCreationExtrinsic,
	    org_acc,
	    {
                resolveOn: Cord.Chain.IS_IN_BLOCK,
                rejectOn: Cord.Chain.IS_ERROR,
	    }
        );
        if (tx && !tx.dispatchError) {
	    let block = tx.status.asInBlock ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock) : '';
	    const qstream = await Cord.Stream.query(stream.identifier);
	    const credential = Cord.Credential.fromRequestAndStream(
                    contentstream,
                    qstream
		);
	  /*
	    const VC = VCUtils.fromCredential(credential, schema);
	  */
	    
	    return {
                vc: undefined, //VC,
                credential: credential,
                stream: stream,
                contentstream: contentstream,
                tx: tx,
		block: block,
	    };
        }
        return { error: tx.dispatchError.toString() };
    } catch (e: any) {
        console.log(e.errorCode, '-', e.message);
        return { error: e.message };
    }
}

export async function revokeStream(
    stream: any
) {
    if (!cordInitDone) {
        await cordInit();
    }
    let org_acc = signing_acc;

    let revokeStreamCreationExtrinsic = await Cord.Stream.revoke(
        stream,
        org_acc
    );

    try {
        const tx = await Cord.Chain.signAndSubmitTx(
            revokeStreamCreationExtrinsic,
            org_acc,
            {
                resolveOn: Cord.Chain.IS_IN_BLOCK,
                rejectOn: Cord.Chain.IS_ERROR,
            }
        );
        return {
            tx: tx,
            block: tx.status.asInBlock
                ? Cord.Utils.Crypto.u8aToHex(tx.status.asInBlock)
                : '',
        };
    } catch (err) {
        return { error: err.message };
    }
}
