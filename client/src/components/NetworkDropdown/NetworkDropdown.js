import { useState } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { getNetwork, switchNetwork } from "@wagmi/core";
import { toast } from "react-toastify";

import ethIcon from "../../images/eth-icon.png";
import polygonIcon from "../../images/polygon-icon.webp";
import optimisimIcon from "../../images/optimisim.svg";
import ftmIcon from "../../images/ftm-icon.png";

const NETWORK_ICON = {
  1: ethIcon,
  137: polygonIcon,
  10: optimisimIcon,
  5: ethIcon,
  250: ftmIcon,
};

const NetworkDropdown = () => {
  const { chains } = getNetwork();
  const [network, setNetwork] = useState(1);
  const handleChange = async (event) => {
    try {
      const network = await switchNetwork({
        chainId: event.target.value,
      });

      setNetwork(network.id);
    } catch (err) {
      toast.error(err.message);
    }
  };
  console.log("CHAINS: ", chains);
  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Network</InputLabel>
        <Select
          id="demo-simple-select"
          value={network}
          label="Network"
          size="small"
          onChange={handleChange}
        >
          {chains.map((chain, index) => (
            <MenuItem key={index} value={chain.id}>
              <Box display="flex" flexDirection="row" alignItems="center">
                <img
                  src={NETWORK_ICON[chain.id]}
                  alt="token"
                  height="25"
                  style={{ marginRight: 10 }}
                />
                {chain.name}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default NetworkDropdown;
