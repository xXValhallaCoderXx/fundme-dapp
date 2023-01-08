import React from "react";
import { Button } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { ConnectButton } from "../ConnectButton";
import xSendImg from "../../images/x-send-2.jpg";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const ROUTES = {
    "/": {
      path: "/tx-history",
      label: "Tx History",
    },
    "/tx-history": {
      path: "/",
      label: "X-Send",
    },
  };
  const handleRedirect = () => {
    navigate(ROUTES[location.pathname].path);
  };
  return (
    <AppBar elevation={0} position="static" color="primary">
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
        <div>
          {" "}
          <img src={xSendImg} alt="logo" height="50" />
        </div>
        {/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          X-Send
        </Typography> */}
        <div>
          <Button
            size="small"
            variant="text"
            color="secondary"
            sx={{ mr: 3 }}
            onClick={handleRedirect}
          >
            {ROUTES[location.pathname].label}
          </Button>

          {/* <ConnectButton onClick={handleConnectWallet} address={address} /> */}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationHeader;
