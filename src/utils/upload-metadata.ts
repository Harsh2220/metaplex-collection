export default async function uploadMetadata(metadata: any): Promise<string> {
    try {
        const response = await fetch(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            {
                method: "POST",
                body: JSON.stringify(metadata),
                headers: {
                    "Content-Type": "application/json",
                    pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
                    pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
                },
            }
        );
        const data = await response.json();

        const metadataUri = `https://ipfs.io/ipfs/${data.IpfsHash}`;
        console.log("Uploaded metadata:", metadataUri);
        return metadataUri;
    } catch (e) {
        console.error("Error uploading to Pinata:", e);
        throw e;
    }
}
