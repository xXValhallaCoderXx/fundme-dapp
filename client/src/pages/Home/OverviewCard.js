import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Button, Box, Grid, Card } from "@mui/material";
import Typography from "@mui/material/Typography";
import { NetworkDropdown } from "../../components/NetworkDropdown";
import { TokenDropdown } from "../../components/TokenDropdown";

// import usdcToken from "../../images/usdc-token.png";
// import usdtToken from "../../images/usdt-token.png";

const TOKENS = {
  usdc: "USDC",
  usdt: "USDT",
};
const OverviewCard = () => {
  const { address } = useAccount();
  const [token, setToken] = useState("usdc");

  const onChangeToken = (value) => {
    setToken(value);
  };
  return (
    <Box>
      <Typography variant="h5" fontWeight={600}>
        Overview
      </Typography>

      <Grid container>
        <Grid item xs={4}>
          <Typography variant="body1" fontWeight={500} mt={2}>
            Connected Wallet
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body1" mt={2}>
            {address}
          </Typography>
        </Grid>
      </Grid>

      <Grid container mt={3} mb={3}>
        <Grid item xs={4}>
          <Typography variant="body1" fontWeight={500} mt={2}>
            Network
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <NetworkDropdown />
        </Grid>
      </Grid>

      <Grid container mb={3}>
        <Grid item xs={4}>
          <Typography variant="body1" fontWeight={500} mt={2}>
            Token
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <TokenDropdown onChangeToken={onChangeToken} />
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={4}>
          <Typography variant="body1" fontWeight={500} mt={2}>
            Wallet Balance
          </Typography>
        </Grid>
        <Grid item xs={8}>
            <Box display="flex" flexDirection="row">
  
          <Typography variant="body1" mt={2}>
            0.0 {TOKENS[token]}
          </Typography>
            </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewCard;
