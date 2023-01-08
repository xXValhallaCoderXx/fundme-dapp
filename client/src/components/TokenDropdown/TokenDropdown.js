import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import usdcToken from "../../images/usdc-token.png";
import usdtToken from "../../images/usdt-token.png";

const TokenDropdown = ({ onChangeToken }) => {
  const [token, setToken] = React.useState("usdc");

  const handleChange = (event) => {
    onChangeToken && onChangeToken(event.target.value);
    setToken(event.target.value);
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Token</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={token}
          label="Token"
          size="small"
          onChange={handleChange}
        >
          <MenuItem value={"usdc"}>
            <Box display="flex" flexDirection="row" alignItems="center">
              <img
                src={usdcToken}
                alt="token"
                height="25"
                style={{ marginRight: 10 }}
              />
              USDC
            </Box>
          </MenuItem>
          <MenuItem value={"usdt"}>
            <Box display="flex" flexDirection="row" alignItems="center">
              <img
                src={usdtToken}
                alt="token"
                height="25"
                style={{ marginRight: 10 }}
              />
              USDT
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default TokenDropdown;
