import { Button } from "@mui/material";
const ConnectedButton = ({ address, onClick }) => {
  const renderButtonContent = () => {
    if (address) {
        
      return (
        <div>
          {/* <div style={{ marginRight: 10 }}>token</div> */}
          <div>Connected</div>
        </div>
      );
    }
    return "Connect Wallet";
  };
  return (
    <Button onClick={onClick} variant="outlined" color="secondary" size="small">
      {renderButtonContent()}
    </Button>
  );
};

export default ConnectedButton;
