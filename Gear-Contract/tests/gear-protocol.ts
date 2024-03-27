import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GearProtocol } from "../target/types/gear_protocol";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
	findMasterEditionPda,
	findMetadataPda,
	mplTokenMetadata,
	MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";

import {
	TOKEN_PROGRAM_ID,
	ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";



describe("solana-nft-anchor", async () => {
	// Configured the client to use the devnet cluster.
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);
	const program = anchor.workspace.GearProtocol as Program<GearProtocol>;

	const signer = provider.wallet;

	const umi = createUmi("https://api.devnet.solana.com")
		.use(walletAdapterIdentity(signer))
		.use(mplTokenMetadata());

	const mint = anchor.web3.Keypair.generate();
	// console.log("mint address=",mint.publicKey);

	const user = anchor.web3.Keypair.generate();
	// console.log("user address=",user.publicKey);
	
	const [gearAccount] = await anchor.web3.PublicKey.findProgramAddressSync(
		[mint.publicKey.toBuffer()],
		program.programId
	  );

	// Derive the associated token address account for the mint
	const associatedTokenAccount = await getAssociatedTokenAddress(
		mint.publicKey,
		signer.publicKey
	);

	// derive the metadata account
	let metadataAccount = findMetadataPda(umi, {
		mint: publicKey(mint.publicKey),
	})[0];

	//derive the master edition pda
	let masterEditionAccount = findMasterEditionPda(umi, {
		mint: publicKey(mint.publicKey),
	})[0];

	const metadata = {
		encrypt_path:"U2FsdGVkX19Q0OIznbsDrRk73PI6VCpTsJ5Sz3afkJHD7/Xsyvs7qSMoNw2Zeqx4",
    	price: 0.0001,
		name: "DogBro",
		symbol: "DGB",
		uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json",
	};
	console.log("user address=",provider.publicKey);
	console.log("mint NTF address=",mint.publicKey);
	console.log("assocgearAccountiatedTokenAccount address=",gearAccount);
	console.log("associatedTokenAccount address=",associatedTokenAccount);
	console.log("metadataAccount address=",metadataAccount);
	console.log("masterEditionAccount address=",masterEditionAccount);

	it("create gear!", async () => {
		const tx = await program.methods
			.createGear(metadata.name, metadata.symbol, metadata.uri, metadata.price, metadata.encrypt_path)
			.accounts({
				signer: provider.publicKey,
				mint: mint.publicKey,
				gearAccount: gearAccount,
				associatedTokenAccount,
				metadataAccount,
				masterEditionAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([mint])
			.rpc();
		console.log(`mint nft tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
		console.log(`minted nft: https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`);
	});

	it("call gear", async () => {
		const tx = await program.methods
		.callGear()
		.accounts({
			nft: mint.publicKey,
			gear: gearAccount,
			user: user.publicKey,
			systemProgram: anchor.web3.SystemProgram.programId
		})
		.signers([user])
		.rpc();
		console.log(`call gear tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
	});

	it("claim token", async ()=> {
		const tx = await program.methods
		.claim()
		.accounts({
			signer: signer.publicKey,
			nft: mint.publicKey,
			gear: gearAccount,
			systemProgram: anchor.web3.SystemProgram.programId
		})
		.rpc();
		console.log(`claim token from gear tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
	});
});