//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenFarm.sol";

contract Staking is ChainlinkClient {

    struct StakesETH {
        uint256 date;
        uint256 amount;
    }

    struct StakesUSDC {
        uint256 date;
        uint256 amount;
    }

    struct StakesOtherToken {
        uint256 date;
        uint256 amount;
    }

    struct StakingTokens {
        bool isStakable;
        string name;
    }

    struct BalancesStakers {
        uint256 balanceETH;
        uint256 balanceUSDC;
        uint256 balanceOtherToken;
    }

    C2PToken private immutable rewardsToken;
    address public owner;

    uint256 rewardRateETH;
    uint256 rewardRateUSDC;
    uint256 rewardRateOtherToken;

    AggregatorV3Interface internal priceFeedETH; 
    AggregatorV3Interface internal priceFeedUSDC;

    mapping (address => StakingTokens) public tokensStakable;
    mapping (address => BalancesStakers) public balances;
    mapping (address => StakesETH[]) public stakesETH;
    mapping (address => StakesUSDC[]) public stakesUSDC;
    mapping (address => StakesOtherToken[]) public stakesOther;

    event TokenAdded (string name, address tokenAddress);
    event StakeETH (uint256 amount, address tokenAddress);
    event StakeUSDC (uint256 amount, address tokenAddress);
    event StakeOtherToken (uint256 amount, address tokenAddress);
    event WithdrawETH (uint256 amount, address tokenAddress);
    event WithdrawUSDC (uint256 amount, address tokenAddress);
    event WithdrawOtherToken (uint256 amount, address tokenAddress);

    constructor(address _ETHAddress, address _USDCAddress, address _c2pToken, uint256 _rewardRateETH, uint256 _rewardRateUSDC, uint256 _rewardRateOtherToken) {
        owner = msg.sender;
        rewardsToken = C2PToken(_c2pToken);
        priceFeedETH = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        priceFeedUSDC = AggregatorV3Interface(0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E);
        tokensStakable[_ETHAddress].isStakable = true;
        tokensStakable[_USDCAddress].isStakable = true;
        rewardRateETH = _rewardRateETH;
        rewardRateUSDC = _rewardRateUSDC;
        rewardRateOtherToken = _rewardRateOtherToken;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function addToken(string calldata _name, address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Address 0");
        require(tokensStakable[_tokenAddress].isStakable != true, "Token already stakable");

        tokensStakable[_tokenAddress].name = _name;
        tokensStakable[_tokenAddress].isStakable = true;

        emit TokenAdded (_name, _tokenAddress);
    }

    function stakeETH(uint256 _amount, address _addressETH) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_addressETH].isStakable = true, "NOT ETH");

        IERC20(_addressETH).transferFrom(msg.sender, address(this), _amount);
        stakesETH[msg.sender].push(StakesETH(block.timestamp, _amount));
        balances[msg.sender].balanceETH += _amount;

        emit StakeETH (_amount, _addressETH);
    }

    function stakeUSDC(uint256 _amount, address _addressUSDC) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_addressUSDC].isStakable = true, "NOT USDC");

        IERC20(_addressUSDC).transferFrom(msg.sender, address(this), _amount);
        stakesUSDC[msg.sender].push(StakesUSDC(block.timestamp, _amount));
        balances[msg.sender].balanceUSDC += _amount;

        emit StakeUSDC (_amount, _addressUSDC);
    }

    function stakeAnotherToken(uint256 _amount, address _tokenAddress) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_tokenAddress].isStakable = true, "Token not stakable");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        stakesOther[msg.sender].push(StakesOtherToken(block.timestamp, _amount));
        balances[msg.sender].balanceOtherToken += _amount;

        emit StakeOtherToken (_amount, _tokenAddress);
    }

    function withdrawETH(uint256 _amount, address _addressETH) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_addressETH].isStakable = true, "NOT ETH");

        balances[msg.sender].balanceETH -= _amount;
        IERC20(_addressETH).transfer(msg.sender, _amount);

        emit WithdrawETH (_amount, _addressETH);
    }

    function withdrawUSDC(uint256 _amount, address _addressUSDC) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_addressUSDC].isStakable = true, "NOT USDC");

        balances[msg.sender].balanceUSDC -= _amount;
        IERC20(_addressUSDC).transfer(msg.sender, _amount);

        emit WithdrawUSDC (_amount, _addressUSDC);
    }

    function withdrawOtherToken(uint256 _amount, address _tokenAddress) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_tokenAddress].isStakable = true, "Token not stakable");

        balances[msg.sender].balanceOtherToken -= _amount;
        IERC20(_tokenAddress).transfer(msg.sender, _amount);

        emit WithdrawOtherToken (_amount, _tokenAddress);
    }

    function getETHValueChainLink() public view returns (uint256) {
        (, int price,,,) = priceFeedETH.latestRoundData();
        return uint256(price) * 1e10;
    }

    function getUSDCValueChainLink() public view returns (uint256) {
        (, int price,,,) = priceFeedUSDC.latestRoundData();
        return uint256(price) * 1e10;
    }

    function getOtherValueChainLink(address _chainlinkAddress) public view returns (uint256) {
        AggregatorV3Interface priceFeedOtherToken = AggregatorV3Interface(_chainlinkAddress);
        (, int price,,,) = priceFeedOtherToken.latestRoundData();
        return uint256(price) * 1e10;
    }

    function calculateRewardValueETH() public view returns (uint256) {
        uint256 rewardValueETH;
        for(uint256 i=0; i < stakesETH[msg.sender].length; i++) {
            rewardValueETH += rewardRateETH * (stakesETH[msg.sender][i].date - block.timestamp);
        }
        return rewardValueETH * getETHValueChainLink();
    }

    function calculateRewardValueUSDC() public view returns (uint256) {
        uint256 rewardValueUSDC;
        for(uint256 i=0; i < stakesUSDC[msg.sender].length; i++) {
            rewardValueUSDC += rewardRateUSDC * (stakesUSDC[msg.sender][i].date - block.timestamp);
        }
        return rewardValueUSDC * getUSDCValueChainLink();
    }

    function calculateRewardValueOther(address _chainlinkAddress) public view returns (uint256) {
        uint256 rewardValueOther;
        for(uint256 i=0; i < stakesOther[msg.sender].length; i++) {
            rewardValueOther += rewardRateOtherToken * (stakesOther[msg.sender][i].date - block.timestamp);
        }
        return rewardValueOther * getOtherValueChainLink(_chainlinkAddress);
    }

    function calculateRewards(address _chainlinkAddress) public view returns (uint256) {
        return calculateRewardValueETH() + calculateRewardValueUSDC() + calculateRewardValueOther(_chainlinkAddress);
    }

    function getBalanceOf() public view onlyOwner returns (BalancesStakers memory) {
        return balances[msg.sender];
    }

    function getRewardAndSupportProject(address _projectAgriculteur, address _chainlinkAddress) external {
        uint256 rewards = calculateRewards(_chainlinkAddress);
        if (rewards > 0) {
            uint256 rewardsForProject = rewards/2;
            uint256 rewardsForStaker = rewards/2;
            rewardsToken.transfer(_projectAgriculteur, rewardsForProject);
            rewardsToken.transfer(msg.sender, rewardsForStaker);
        }
    }
}


