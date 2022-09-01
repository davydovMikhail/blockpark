import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as mocha from "mocha-steps";
import { PropToken } from '../typechain-types';

function toWei(amount: number, decimals: number): BigNumber {
	return ethers.utils.parseUnits(amount.toString(), decimals);
}

describe("PROP TOKEN test", function () {
    let token: PropToken;
    let owner: SignerWithAddress;
    let newOwner: SignerWithAddress;
    let admin: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;
    let whitelistUser1: SignerWithAddress;
    let whitelistUser2: SignerWithAddress;
    let whitelistUser3: SignerWithAddress;


    beforeEach(async () => {
        [ owner, newOwner, admin, user1, user2, user3, whitelistUser1, whitelistUser2, whitelistUser3 ] = await ethers.getSigners();
    });

    const decimals = 8;
    const totalSupply = toWei(10_000_000_000, decimals);

    mocha.step("Deploy", async function () {
      const tokenF = await ethers.getContractFactory('PropToken');
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

    mocha.step("Check allownce fumction", async function () {
      expect(await token.allowance(owner.address, user1.address)).to.equal(0);
      const valueForApprove = toWei(100, decimals);
      await token.connect(owner).approve(user1.address, valueForApprove);
      expect(await token.allowance(owner.address, user1.address)).to.equal(valueForApprove);
    });
  
    mocha.step("Check transferFrom function", async function () {
      const valueForApprove = toWei(100, decimals);
      const valueForTransfer = toWei(30, decimals);
      await expect(token.connect(user1).transferFrom(owner.address, user2.address, valueForTransfer.mul(10))).to.be.revertedWith("ERC20: insufficient allowance");
      await token.connect(user1).transferFrom(owner.address, user2.address, valueForTransfer);
      expect(await token.balanceOf(user2.address)).to.equal(valueForTransfer);
      expect(await token.balanceOf(owner.address)).to.equal(totalSupply.sub(valueForTransfer));
      expect(await token.allowance(owner.address, user1.address)).to.equal(valueForApprove.sub(valueForTransfer));
    });

    mocha.step('Check transfer function', async function () {
      const valueForTransfer1 = toWei(100, decimals); // 100
      const valueForTransfer2 = toWei(80, decimals); // 80
      const valueForTransfer3 = toWei(60, decimals);// 60
      await token.connect(owner).transfer(user1.address, valueForTransfer1);
      expect(await token.balanceOf(user1.address)).to.equal(valueForTransfer1);
      await token.connect(user1).transfer(user2.address, valueForTransfer2)
      expect(await token.balanceOf(user1.address)).to.equal(valueForTransfer1.sub(valueForTransfer2));
      await token.connect(user2).transfer(user3.address, valueForTransfer3);
      expect(await token.balanceOf(user3.address)).to.equal(valueForTransfer3);
    });

    mocha.step("Check AccessControll for ADMIN_ROLE", async function () {
      await expect(token.connect(user1).grantRole((await token.ADMIN_ROLE()), admin.address)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.DEFAULT_ADMIN_ROLE()).toLowerCase()}`);
    });

    mocha.step("Grant roles", async function () {
      await token.connect(owner).grantRole((await token.ADMIN_ROLE()), admin.address);
    });

    mocha.step("Check getRoleAdmin function", async function () {
      const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
      const ADMIN_ROLE = await token.ADMIN_ROLE();
      expect(await token.getRoleAdmin(ADMIN_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
      expect(await token.getRoleAdmin(DEFAULT_ADMIN_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    });

    mocha.step("Check AccessControl for changeBlocklist function", async function () {
      await expect(token.connect(user1).changeBlocklist(user2.address, true)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call changeBlocklist function", async function () {
      await token.connect(admin).changeBlocklist(user1.address, true);
      await token.connect(admin).changeBlocklist(user2.address, true);
    });

    mocha.step("Check blocklist mapping", async function () {
      expect(await token.blocklist(user1.address)).to.equal(true);
      expect(await token.blocklist(user2.address)).to.equal(true);
      expect(await token.blocklist(user3.address)).to.equal(false);
    });

    mocha.step("Check transfer for blocklisted users", async function () {
      const amount = toWei(10, decimals);
      await expect(token.connect(user1).transfer(user3.address, amount)).to.be.revertedWith("You are blocklisted.");
      await expect(token.connect(user2).transfer(user3.address, amount)).to.be.revertedWith("You are blocklisted.");
      await token.connect(user1).approve(user2.address, amount);
      await token.connect(user2).approve(user1.address, amount);
      await expect(token.connect(user2).transferFrom(user1.address, user3.address, amount)).to.be.revertedWith("You are blocklisted.");
      await expect(token.connect(user1).transferFrom(user2.address, user3.address, amount)).to.be.revertedWith("You are blocklisted.");
    });

    mocha.step("Check AccessControl for changeWhitelist function", async function () {
      await expect(token.connect(user1).changeWhitelist(whitelistUser1.address, true)).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call changeWhitelist function", async function () {
      await token.connect(admin).changeWhitelist(whitelistUser1.address, true);
      await token.connect(admin).changeWhitelist(whitelistUser2.address, true);
      await token.connect(admin).changeWhitelist(whitelistUser3.address, true);
      await token.connect(admin).changeWhitelist(owner.address, true);
    });

    mocha.step("Check whitelist mapping", async function () {
      expect(await token.whitelist(whitelistUser1.address)).to.equal(true);
      expect(await token.whitelist(whitelistUser2.address)).to.equal(true);
      expect(await token.whitelist(whitelistUser3.address)).to.equal(true);
      expect(await token.whitelist(owner.address)).to.equal(true);
      expect(await token.whitelist(user1.address)).to.equal(false);        
    });

    mocha.step("Check AccessControll for pause function", async function () {
      await expect(token.connect(user1).pause()).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call pause function", async function () {
        await token.connect(admin).pause();
    });

    mocha.step("Check transfer for not whitelisted users", async function () {
      const amount = toWei(10, decimals);
      await expect(token.connect(newOwner).transfer(owner.address, amount)).to.be.revertedWith("Token on pause.");
      await token.connect(user3).approve(newOwner.address, amount);
      await expect(token.connect(newOwner).transferFrom(user3.address, owner.address, amount)).to.be.revertedWith("Token on pause.");
    });

    mocha.step("Replenishment of user account from whitelist", async function () {
      const amount = toWei(10000, decimals);
      await token.connect(owner).transfer(whitelistUser1.address, amount);
      await token.connect(owner).transfer(whitelistUser2.address, amount);
      await token.connect(owner).transfer(whitelistUser3.address, amount);
    });

    mocha.step("Check balances whitelist users after transfers", async function () {
      const amount = toWei(10000, decimals);
      expect(await token.balanceOf(whitelistUser1.address)).to.equal(amount);
      expect(await token.balanceOf(whitelistUser2.address)).to.equal(amount);        
      expect(await token.balanceOf(whitelistUser3.address)).to.equal(amount);        
    });

    mocha.step("Check transferFrom function for whitelist users", async function () {
      const amount = toWei(2000, decimals);
      await token.connect(whitelistUser1).approve(whitelistUser2.address, amount);
      await token.connect(whitelistUser2).transferFrom(whitelistUser1.address, whitelistUser3.address, amount);
    });

    mocha.step("Check balances whitelist users after transferFrom", async function () {
      expect(await token.balanceOf(whitelistUser1.address)).to.equal(toWei(8000, decimals));
      expect(await token.balanceOf(whitelistUser3.address)).to.equal(toWei(12000, decimals));
    });

    mocha.step("Check AccessControll for unpause function", async function () {
      await expect(token.connect(user1).unpause()).to.be.revertedWith(`AccessControl: account ${user1.address.toLowerCase()} is missing role ${(await token.ADMIN_ROLE()).toLowerCase()}`);
    });

    mocha.step("Call unpause function", async function () {
        await token.connect(admin).unpause();
    });

    mocha.step("Check AccessControll for setNewOwner function", async function () {
      await expect(token.connect(user1).setNewOwner(newOwner.address)).to.be.revertedWith('This function can only be called by the current owner.');
    });

    mocha.step("Call setNewOwner function", async function () {
      await token.connect(owner).setNewOwner(newOwner.address);
    });

    mocha.step("Check getOwner function after call setNewOwner function", async function () {
      expect(await token.getOwner()).to.equal(newOwner.address);
    })
});
