import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";
import * as mocha from "mocha-steps";
import { PROPTOKEN } from '../typechain-types';

function toWei(amount: number, decimals: number): BigNumber {
	return ethers.utils.parseUnits(amount.toString(), decimals);
}

describe("PROP TOKEN test", function () {
    let token: PROPTOKEN;
    let owner: SignerWithAddress;
    let newOwner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    beforeEach(async () => {
        [ owner, newOwner, user1, user2 ] = await ethers.getSigners();
    });

    const decimals = 8;
    const totalSupply = toWei(10_000_000_000, decimals);

    mocha.step("Deploy", async function () {
      const tokenF = await ethers.getContractFactory('PROPTOKEN');
      token = await tokenF.connect(owner).deploy(totalSupply);
    });

    mocha.step("Check view functions", async function () {
      expect(await token.name()).to.equal("PROP TOKEN");
      expect(await token.symbol()).to.equal("PROP");
      expect(await token.decimals()).to.equal(8);
      expect(await token.getOwner()).to.equal(owner.address);
      expect(await token.totalSupply()).to.equal(totalSupply);
      expect(await token.balanceOf(owner.address)).to.equal(totalSupply);      
    });

    
  


});
