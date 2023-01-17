// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error CreateCampaign__MissingValues();

/**  
    @title Crowd Funding Contract
    @author Renate Gouveia
    @notice This contract allows a wallet to have 1 ongoing campaign - users can deposit into it - the campaign creator can withdraw funds
    @dev This implements ChainLinkOracle for price feed to allow for minimum funds deposits
 */

contract CrowdFunder {
    using PriceConverter for uint256;

    struct Campaign {
        uint256 allocatedFunds;
        string name;
        string description;
        address owner;
    }

    // uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable i_owner;
    mapping(address => Campaign) public s_addressToCampaign;

    AggregatorV3Interface private s_priceFeed;

    event savingsEvent(uint256 indexed _memberId);

    // Modifers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _; // Represents the rest of the code in function
    }

    // This is the order of functions
    constructor(address _priceFeed) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
        i_owner = msg.sender;
    }

    // receive() external payable {
    //     createCampaign();
    // }

    // fallback() external payable {
    //     createCampaign();
    // }

    /**  
        @dev If a wallet has an anctive campaign (campaign with funds) we should not allow them to create another
    */
    function createCampaign(string memory _name, string memory _description)
        public
        payable
    {
        if (
            keccak256(abi.encodePacked(s_addressToCampaign[msg.sender].name)) !=
            keccak256(abi.encodePacked(""))
        ) {
            revert("You have an active campaign");
        }
        s_addressToCampaign[msg.sender] = Campaign(
            0,
            _name,
            _description,
            msg.sender
        );
    }

    /**  
        @dev Stop any funds coming into the contract if a campaign does not exist
    */
    function fundCampaign(address campaignAddress) public payable {
        if (s_addressToCampaign[campaignAddress].owner == address(0)) {
            revert("Address has no campaign");
        }
        uint256 currentFunds = s_addressToCampaign[campaignAddress]
            .allocatedFunds;
        s_addressToCampaign[campaignAddress].allocatedFunds =
            currentFunds +
            msg.value;
    }

    /**  
        @dev Campaign owners (set by wallet address) are able to withdraw funds deposited to them - aftet this the campain should be reset
    */
    function withdrawFundsFromCampaign() public payable {
        Campaign memory campaign = s_addressToCampaign[msg.sender];
        if (campaign.allocatedFunds > 0) {
            (bool callSuccess, ) = payable(msg.sender).call{
                value: campaign.allocatedFunds
            }("");
            campaign.allocatedFunds = 0;
            campaign.name = "";
            campaign.description = "";
            s_addressToCampaign[msg.sender] = campaign;
        }
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getCampaign(address index) public view returns (Campaign memory) {
        return s_addressToCampaign[index];
    }

    function getTotalFundraised() public view returns (uint256) {
        return address(this).balance;
    }
}
