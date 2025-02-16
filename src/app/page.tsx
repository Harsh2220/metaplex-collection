"use client";

import uploadMetadata from "@/utils/upload-metadata";
import {
  Adapter,
  UnifiedWalletButton,
  useWallet,
} from "@jup-ag/wallet-adapter";
import {
  createNft,
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import {
  publicKey as UMIPublicKey,
  generateSigner,
  percentAmount,
  sol,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { base58 } from "@metaplex-foundation/umi/serializers";

export default function page() {
  const { wallet, publicKey } = useWallet();
  const umi = createUmi("https://api.devnet.solana.com")
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet?.adapter as Adapter));

  async function handleCreateCollection() {
    const collection = generateSigner(umi);
    console.log(collection, "collection");
    const collectionMetadata = {
      name: "MemeBear Collection",
      description: "Your wallet's trading history, but in bear form.",
      image:
        "https://www.shutterstock.com/image-vector/cute-bear-illustration-perfect-childrens-600nw-2472783349.jpg",
    };
    const collectionMetadataUri = await uploadMetadata(collectionMetadata);
    console.log(collectionMetadataUri, "collectionMetadataUri");

    const mint = generateSigner(umi);

    const tx = await createNft(umi, {
      mint: mint,
      name: "MemeBear 3",
      symbol: "MEME",
      sellerFeeBasisPoints: percentAmount(0),
      isCollection: true,
      uri: collectionMetadataUri,
    }).sendAndConfirm(umi);
    const signature = base58.deserialize(tx.signature)[0];
    console.log(signature, "signature");
  }

  async function handleMintNFT() {
    const MINT_PRICE = 0.1;
    const PRIMARY_CREATOR_1_SHARE = 80;
    const PRIMARY_CREATOR_2_SHARE = 20;

    const creator1Amount = (MINT_PRICE * PRIMARY_CREATOR_1_SHARE) / 100;
    const creator2Amount = (MINT_PRICE * PRIMARY_CREATOR_2_SHARE) / 100;

    const metadataInfo = {
      name: "MemeBear 4",
      description: "Your wallet's trading history, but in bear form...",
      symbol: "MEME",
      image:
        "https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622021.jpg",
      attributes: [
        {
          trait_type: "Species Name",
          value: "Islands",
        },
        {
          trait_type: "Expression Name",
          value: "Frown",
        },
        {
          trait_type: "Eyes",
          value: "Eye.LCD.Red",
        },
        {
          trait_type: "T-Shirt",
          value: "skill issue",
        },
        {
          trait_type: "DNA",
          value: "Sulphur / Diamond",
        },
        {
          trait_type: "Background",
          value: "#c50000",
        },
        {
          trait_type: "Mouth",
          value: "Empty",
        },
      ],
      properties: {
        files: [
          {
            uri: "https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622021.jpg",
            type: "image/jpg",
          },
        ],
        category: "image",
      },
      sellerFeeBasisPoints: 500,
    };

    const metadataUri = await uploadMetadata({
      name: metadataInfo.name,
      description: metadataInfo.description,
      symbol: metadataInfo.symbol,
      image: metadataInfo.image,
      attributes: metadataInfo.attributes,
      properties: metadataInfo.properties,
    });

    console.log(metadataUri, "metadataUri");

    const collectionNftAddress = UMIPublicKey(
      "E1vTx3YL3EHBVGdUBiMzkxxP863dLc6nDQgqZkJQdtJp"
    );

    const creator1 = UMIPublicKey(
      "9bARipSq8xHuh6udnhzc7fdYpnpxf6c3i9Zs4GdwuAM3"
    );

    const creator2 = UMIPublicKey(
      "3KfUcTXzkaeyssSWCt2RB9q1gGmMdrKQdDBrM8hMJdq8"
    );

    const mint = generateSigner(umi);

    console.log(mint.publicKey.toString(), "mint key");

    const tx = transactionBuilder()
      .add(
        transferSol(umi, {
          source: umi.identity,
          destination: creator1,
          amount: sol(creator1Amount),
        })
      )
      .add(
        transferSol(umi, {
          source: umi.identity,
          destination: creator2,
          amount: sol(creator2Amount),
        })
      )
      .add(
        createNft(umi, {
          mint: mint,
          name: "MemeBear 3",
          symbol: "MEME",
          uri: metadataUri,
          updateAuthority: umi.identity.publicKey,
          sellerFeeBasisPoints: percentAmount(2.5),
          creators: [
            {
              address: creator1,
              verified: false,
              share: 90,
            },
            {
              address: creator2,
              verified: false,
              share: 10,
            },
          ],
          collection: {
            key: collectionNftAddress,
            verified: false,
          },
        })
      );

    await tx.sendAndConfirm(umi);

    console.log(mint.publicKey, "minted");
  }

  async function handleVerify() {
    try {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      const nftAddress = UMIPublicKey(
        "E95MQo7BeyKQJLf5b1M5weat7NLanLunfQn6cf3fP9JG"
      );

      const collectionAddress = UMIPublicKey(
        "E1vTx3YL3EHBVGdUBiMzkxxP863dLc6nDQgqZkJQdtJp"
      );

      const nftMetadata = findMetadataPda(umi, { mint: nftAddress });

      const collectionMetadata = findMetadataPda(umi, {
        mint: collectionAddress,
      });

      console.log(nftMetadata, "nftMetadata");
      console.log(collectionMetadata, "collectionMetadata");

      try {
        const tx = await verifyCollectionV1(umi, {
          metadata: nftMetadata,
          collectionMint: collectionAddress,
          authority: umi.identity,
        }).sendAndConfirm(umi, {
          send: { commitment: "confirmed" },
          confirm: { commitment: "confirmed" },
        });

        console.log(
          "Verification transaction sent:",
          base58.deserialize(tx.signature)[0]
        );
      } catch (verifyError: any) {
        console.error("Verification failed with error:", verifyError);
        if (verifyError.logs) {
          console.error("Transaction logs:", verifyError.logs);
        }
        throw verifyError;
      }
    } catch (error: any) {
      console.error("Error in handleVerify:", error);
      if (error.message) {
        console.error("Error message:", error.message);
      }
      throw error;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <UnifiedWalletButton />
      <button onClick={handleCreateCollection}>create collection</button>
      <button onClick={handleMintNFT}>mint nft</button>
      <button onClick={handleVerify}>verify</button>
    </div>
  );
}
