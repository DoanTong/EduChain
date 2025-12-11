import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const CertificateABI = require("../abi/EduChainCertificate.json");

if (!process.env.ADMIN_PRIVATE_KEY) {
  throw new Error("Missing ADMIN_PRIVATE_KEY in .env");
}

if (!process.env.CERTIFICATE_CONTRACT) {
  throw new Error("Missing CERTIFICATE_CONTRACT in .env");
}

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CERTIFICATE_CONTRACT,
  CertificateABI.abi,
  wallet
);
console.log("📌 Loaded Contract Address:", process.env.CERTIFICATE_CONTRACT);
console.log("📌 Admin Wallet:", wallet.address);
// ==========================================
// 🔥 FIX MINT NFT — ethers v6 compatible
// ==========================================

export async function mintCertificateOnChain(studentWallet, metadataURL) {
  try {
    console.log("Minting NFT →", studentWallet, metadataURL);
    console.log("======== DEBUG MINT ========");
console.log("Contract:", contract.target);
console.log("Student wallet:", studentWallet);
console.log("Metadata URL:", metadataURL);
console.log("============================");
    const tx = await contract.mintCertificate(studentWallet, metadataURL);
    const receipt = await tx.wait();

    // Find ERC721 Transfer event
    const transferLog = receipt.logs.find(
      (l) => l.address.toLowerCase() === contract.target.toLowerCase()
    );

    if (!transferLog) throw new Error("No Transfer event found!");

    const iface = new ethers.Interface(CertificateABI.abi);
    const parsed = iface.parseLog(transferLog);

    const tokenId = Number(parsed.args.tokenId);

    return {
      txHash: tx.hash,
      tokenId,
    };

  } catch (err) {
    console.error("Mint NFT error:", err);
    throw err;
  }
}
