const pinataSDK = require("@pinata/sdk");

export async function uploadJsonToIPFS(json: any) {
  const pinata = new pinataSDK({
    pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    pinataSecretApiKey: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
  });
  const res = await pinata.pinJSONToIPFS(json);
  if (res?.IpfsHash) {
    return `https://gateway.pinata.cloud/ipfs/${res.IpfsHash}`;
  } else {
    throw new Error("Failed to upload JSON to IPFS");
  }

  return res?.IpfsHash;
}
