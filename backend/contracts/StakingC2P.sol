//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./C2PToken.sol";

//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./C2PToken.sol";

contract Staking is ChainlinkClient {

    struct StakingToken {
        bool isStakable;
        string name;
    }

    IERC20 public immutable rewardsToken;
    address public owner;
    uint256 public rewardsTimeInSec;
    uint256 public rewardsFinish;
    uint256 public updatedAt;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    AggregatorV3Interface internal priceFeedETH; 
    AggregatorV3Interface internal priceFeedDAI;

    mapping (address => StakingToken) public tokensStakable;
    mapping (address => uint256) public userRewardPerTokenPaid;
    mapping (address => uint256) public rewardsAvailableFor;
    mapping (address => uint256) public stakedAmountOf;

    event TokenAdded (string name, address tokenAddress);
    event Stake (uint256 amount, address tokenAddress);
    event Withdraw (uint256 amount, address tokenAddress);

    constructor(address _c2pToken) {
        owner = msg.sender;
        rewardsToken = IERC20(_c2pToken);
        priceFeedETH = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        priceFeedDAI = AggregatorV3Interface(0x14866185B1962B63C3Ea9E03Bc1da838bab34C19);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewardsAvailableFor[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(rewardsFinish, block.timestamp);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored
            + (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18)
                / totalStaked;
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(rewardsFinish < block.timestamp, "reward duration not finished");
        rewardsTimeInSec = _duration;
    }

    function notifyRewardAmount(uint256 _amount) external onlyOwner updateReward(address(0))
    {
        if (block.timestamp >= rewardsFinish) {
            rewardRate = _amount / rewardsTimeInSec;
        } else {
            uint256 remainingRewards = (rewardsFinish - block.timestamp) * rewardRate;
            rewardRate = (_amount + remainingRewards) / rewardsTimeInSec;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(
            rewardRate * rewardsTimeInSec <= rewardsToken.balanceOf(address(this)),
            "reward amount > balance"
        );

        rewardsFinish = block.timestamp + rewardsTimeInSec;
        updatedAt = block.timestamp;
    }

    function stake(uint256 _amount, address _tokenAddress) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_tokenAddress].isStakable = true, "Token not stakable");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        stakedAmountOf[msg.sender] += _amount;
        totalStaked += _amount;

        emit Stake(_amount, _tokenAddress);
    }

    function withdraw(uint256 _amount, address _tokenAddress) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_tokenAddress].isStakable = true, "Token not stakable");

        stakedAmountOf[msg.sender] -= _amount;
        totalStaked -= _amount;
        IERC20(_tokenAddress).transfer(msg.sender, _amount);

        emit Withdraw(_amount, _tokenAddress);
    }

    function earned(address _account) public view returns (uint256) {
        return (
            (
                stakedAmountOf[_account]
                    * (rewardPerToken() - userRewardPerTokenPaid[_account])
            ) / 1e18
        ) + rewardsAvailableFor[_account];
    }

    //function rewardPerUsd(){}

    function getETHUSDValueChainlink() external view returns (uint256) {
        (, int price,,,) = priceFeedETH.latestRoundData();
        return uint256(price) * 1e10;
    }

    function getDAIUSDValueChainlink() public view returns (uint256) {
        (, int price,,,) = priceFeedDAI.latestRoundData();
        return uint256(price) * 1e10;
    }

    function addToken(string calldata _name, address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Address 0");
        require(tokensStakable[_tokenAddress].isStakable != true, "Token already stakable");

        tokensStakable[_tokenAddress].name = _name;
        tokensStakable[_tokenAddress].isStakable = true;

        emit TokenAdded(_name, _tokenAddress);
    }

    function getAndSupportProjectReward(address _projectAgriculteur) external updateReward(msg.sender) {
        uint256 reward = rewardsAvailableFor[msg.sender];
        if (reward > 0) {
            rewardsAvailableFor[msg.sender] = 0;
            uint256 rewardForProject = reward/2;
            uint256 rewardForStaker = reward/2;
            rewardsToken.transfer(_projectAgriculteur, rewardForProject);
            rewardsToken.transfer(msg.sender, rewardForStaker);
        }
    }
}



