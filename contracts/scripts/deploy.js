const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with address:", deployer.address);

  const EduChainCertificate = await hre.ethers.getContractFactory("EduChainCertificate");

  // deploy contract, truyền owner = deployer
  const contract = await EduChainCertificate.deploy(deployer.address);

  // ⚠️ Ethers v5: phải chờ .deployed()
  await contract.deployed();

  console.log("Contract deployed at:", contract.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
