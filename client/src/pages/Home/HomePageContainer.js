import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { useContractRead, useAccount } from "wagmi";
import { CROWD_FUND_ABI, CROWD_FUND_ADDRESS } from "../../abi/crowd-fund-abi";
import { fetchBalance } from "@wagmi/core";
import { Navbar } from "../../components/NavigationHeader";

const MultiSendContainer = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const { address, isConnected } = useAccount();
  console.log("ADDRESS: ", address);
  const { data, isError, isLoading } = useContractRead({
    address: CROWD_FUND_ADDRESS,
    abi: CROWD_FUND_ABI,
    functionName: "getTotalFundraised",
  });
  console.log("dATA: ", data);

  useEffect(() => {
    updateContractBalance();
  }, []);

  const updateContractBalance = async () => {
    const balance = await fetchBalance({
      address: CROWD_FUND_ADDRESS,
    });
    console.log("BALANACE: ", balance);
    setBalance(balance.formatted);
  };

  const handleOnClick = () => {
    updateContractBalance();
  };

  // console.log("DATA: ", isError);
  // const handleOnClickFund = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   // await provider.send("eth_requestAccounts", []);
  //   const signer = provider.getSigner();
  //   const contract = new ethers.Contract(FUND_ME_ADDRESS, FUND_ME_ABI, signer);
  //   try {
  //     const txResponse = await contract.fund({
  //       value: ethers.utils.parseEther("1"),
  //     });
  //     await listenForTxMine(txResponse, provider);
  //     console.log("Done");
  //   } catch (err) {}
  // };

  // const listenForTxMine = async (txResponse, provider) => {
  //   return new Promise((res, rej) => {
  //     try {
  //       provider.once(txResponse.hash, (txReciept) => {
  //         console.log("Completed with : ", txReciept.confirmations);
  //         res();
  //       });
  //     } catch (e) {
  //       rej(e);
  //     }
  //   });
  // };

  // const connectToMetamask = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const accounts = await provider.send("eth_requestAccounts", []);
  //   setAccount(accounts[0]);
  // };

  // const withdrawFunds = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   await provider.send("eth_requestAccounts", []);
  //   const signer = provider.getSigner();
  //   const contract = new ethers.Contract(FUND_ME_ADDRESS, FUND_ME_ABI, signer);
  //   try {
  //     const txResponse = await contract.withdraw();
  //     await listenForTxMine(txResponse, provider);
  //     console.log("Done");
  //   } catch (err) {}
  // };

  // const getBalance = async () => {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   try {
  //     const balance = await provider.getBalance(FUND_ME_ADDRESS);
  //     setBalance(ethers.utils.formatEther(balance));
  //     console.log("Done");
  //   } catch (err) {}
  // };
  console.log("BALANCE: ", balance);
  return (
    <Box style={{ backgroundColor: "#F2F2F2", height: "100vh" }}>
      <Navbar />
      <Box px={3}>
        <Box>
          <Typography>
            Total Value Locked: {balance ? <span>{balance} Ether</span> : 0}
          </Typography>
        </Box>
        <Box mt={2}>
          <Typography>Your Campaisns</Typography>
          You Currentl have no active campaigns
        </Box>
        <Box mt={2}>Active Campaigns</Box>
        <Button onClick={handleOnClick}>hehe</Button>
      </Box>
    </Box>
  );
};

export default MultiSendContainer;
