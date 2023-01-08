// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

 error FundMe__NotOwner();

 // Solc Compiler can auto generated docs from this (NatsSpec)
/**  
    @title A contract for crowd funding
    @author Renate Gouveia
    @notice This is a sample
    @dev This implements price feed
 */

contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State variables
    // If you know value at compile time
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] private s_funders;
    address private immutable i_owner;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    // Modifers
    modifier onlyOwner() {
        if(msg.sender != i_owner) revert FundMe__NotOwner();
        // require(msg.sender == i_owner, "Only owner can withdraw");
        _; // Represents the rest of the code in function
    }

    // This is the order of functions
    constructor(address _priceFeed) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // User functions
    // Public , internal, private

    /**  
        @notice This funds the contract
        @dev Some stuff for the devs
    */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public payable onlyOwner {
        // Very expensive
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // Cheaper to reset the array
        s_funders = new address[](0);
        // Call any function all of ethereum without know the ABI
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success,) = i_owner.call{value: address(this).balance}("");
        require(success);
    }
    
    function getOwner() public view returns(address){
        return i_owner;
    }

    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address index) public view returns(uint256){
        return s_addressToAmountFunded[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface){
        return s_priceFeed;
    }
}
