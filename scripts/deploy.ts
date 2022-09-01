import { ethers } from "hardhat";

async function main() {
 
  const PropToken = await ethers.getContractFactory("PropToken");
  const propToken = await PropToken.deploy(process.env.TOTAL_SUPPLY as string);

  await propToken.deployed();

  console.log(`PropToken contract deployed to ${propToken.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
