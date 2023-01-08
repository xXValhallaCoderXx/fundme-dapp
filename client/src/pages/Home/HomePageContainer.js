import React, { useState } from "react";
import { Button, Box } from "@mui/material";

import { Navbar } from "../../components/NavigationHeader";

import { ethers } from "ethers";
import { FUND_ME_ABI, FUND_ME_ADDRESS } from "../../abi/fundme-abi";

const MultiSendContainer = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");

  const handleOnClickFund = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(FUND_ME_ADDRESS, FUND_ME_ABI, signer);
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther("1"),
      });
      await listenForTxMine(txResponse, provider);
      console.log("Done");
    } catch (err) {}
  };

  const listenForTxMine = async (txResponse, provider) => {
    return new Promise((res, rej) => {
      try {
        provider.once(txResponse.hash, (txReciept) => {
          console.log("Completed with : ", txReciept.confirmations);
          res();
        });
      } catch (e) {
        rej(e);
      }
    });
  };

  const connectToMetamask = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  const withdrawFunds = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(FUND_ME_ADDRESS, FUND_ME_ABI, signer);
    try {
      const txResponse = await contract.withdraw();
      await listenForTxMine(txResponse, provider);
      console.log("Done");
    } catch (err) {}
  };

  const getBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(FUND_ME_ADDRESS);
      setBalance(ethers.utils.formatEther(balance));
      console.log("Done");
    } catch (err) {}
  };

  return (
    <Box style={{ backgroundColor: "#F2F2F2", height: "100vh" }}>
      <Navbar />
      <Box px={3}>
        <Box>
          <div>
            <Button onClick={connectToMetamask}>Connect</Button>
            <Button onClick={handleOnClickFund}>Fund</Button>
            <Button onClick={withdrawFunds}>Withdraw</Button>
            <Button onClick={getBalance}>Balance</Button>
          </div>
          {balance && <div>{balance}</div>}
        </Box>
      </Box>
    </Box>
  );
};

export default MultiSendContainer;
