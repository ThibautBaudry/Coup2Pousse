//SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

/// @title Un contrat intelligent de staking
/// @author Thibaut Baudry
/// @notice Ce contrat intelligent permet de staker de l'USDC ou un autre token de son choix
/// @notice On considère que les rewards sont effectués en C2P avec un taux de 1 C2P = 1 USD
/// @notice Le taux de reward est de 0,001%/seconde pour l'USDC
/// @notice Le taux de reward est de 0,0015%/seconde pour les autres tokens
/// @dev Le contrat intelligent est ChainlinkClient, le contrat donnera la valeur de l'USDC et du token de son choix de manière sécurisée

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenFarm.sol";
import "./ProjectsFarm.sol";

contract Staking is ChainlinkClient {

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
        uint256 balanceUSDC;
        uint256 balanceOtherToken;
    }

    C2PToken public immutable rewardsToken;
    address public owner;
    uint64 numerateur = 1e18;
    uint256 rewardRateUSDC = 100;
    uint256 rewardRateOtherToken = 150;

    AggregatorV3Interface internal priceFeedUSDC;

    mapping (address => StakingTokens) public tokensStakable;
    mapping (address => BalancesStakers) public balances;
    mapping (address => StakesUSDC[]) public stakesUSDC;
    mapping (address => StakesOtherToken[]) public stakesOther;

    /// @notice Emit lorsqu'un token est ajouté
    /// @param name Le nom du token
    /// @param tokenAddress L'adresse du token
    event TokenAdded (string name, address tokenAddress);

    /// @notice Emit lorsqu'un stake USDC est effectué
    /// @param amount Le montant du stake
    /// @param tokenAddress L'adresse du token USDC
    event StakeUSDC (uint256 amount, address tokenAddress);

    /// @notice Emit lorsqu'un stake d'un autre token est effectué
    /// @param amount Le montant du stake
    /// @param tokenAddress L'adresse de ce token
    event StakeOtherToken (uint256 amount, address tokenAddress);

    /// @notice Emit lorsqu'un withdraw USDC est effectué
    /// @param amount Le montant du withdraw
    /// @param tokenAddress L'adresse du token USDC
    /// @param indiceStake Le stake sur lequel s'effectue le withdraw
    event WithdrawUSDC (uint256 amount, address tokenAddress, uint256 indiceStake);

    /// @notice Emit lorsqu'un withdraw d'un autre token est effectué
    /// @param amount Le montant du stake
    /// @param tokenAddress L'adresse de ce token
    /// @param indiceStake Le stake sur lequel s'effectue le withdraw
    event WithdrawOtherToken (uint256 amount, address tokenAddress, uint256 indiceStake);

    /// @dev Définit l'adresse qui déploie comme propriétaire du contract
    /// @dev Définit le C2P comme token de reward
    /// @dev Définit le hash chainlink USDC/USD comme priceFeedUSDC
    /// @dev Enregistre le nom de l'USDC et le définit stakable
    /// @dev Définit taux de reward du token USDC
    /// @dev Définit taux de reward des autres tokens
    /// @param _USDCAddress L'addresse du token USDC
    /// @param _c2pToken L'addresse du token C2P
    constructor(address _USDCAddress, address _c2pToken) {
        owner = msg.sender;
        rewardsToken = C2PToken(_c2pToken);
        priceFeedUSDC = AggregatorV3Interface(0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E);
        tokensStakable[_USDCAddress].isStakable = true;
        tokensStakable[_USDCAddress].name = "USDC";
    }

    /// @dev S'assure que l'appelant d'une fonction est le propriétaire du contrat
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /// @notice Enregistre un token stakable
    /// @dev Ne peut être exécuté que par le propriétaire du contrat
    /// @param _name Le nom du token à enregistrer
    /// @param _tokenAddress Son addresse
    function addToken(string calldata _name, address _tokenAddress) public onlyOwner {
        require(_tokenAddress != address(0), "Address 0");
        require(tokensStakable[_tokenAddress].isStakable != true, "Already stakable");

        tokensStakable[_tokenAddress].isStakable = true;
        tokensStakable[_tokenAddress].name = _name;

        emit TokenAdded (_name, _tokenAddress);
    }

    /// @notice Stake de l'USDC
    /// @param _amount Le montant d'USDC à staker
    /// @param _addressUSDC L'adresse du token USDC
    function stakeUSDC(uint256 _amount, address _addressUSDC) external {
        require(_amount > 0, "amount = 0");
        require((keccak256(abi.encode(tokensStakable[_addressUSDC].name))) == (keccak256(abi.encode("USDC"))), "NOT USDC");
        require(stakesUSDC[msg.sender].length < 1000, "");

        IERC20(_addressUSDC).transferFrom(msg.sender, address(this), _amount);
        stakesUSDC[msg.sender].push(StakesUSDC(block.timestamp, _amount));
        balances[msg.sender].balanceUSDC += _amount;

        emit StakeUSDC (_amount, _addressUSDC);
    }

    /// @notice Stake un token enregistré comme stakable
    /// @param _amount Le montant du token à staker
    /// @param _tokenAddress L'adresse du token 
    function stakeOtherToken(uint256 _amount, address _tokenAddress) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_tokenAddress].isStakable = true, "Not stakable");
        require(stakesOther[msg.sender].length < 1000, "");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        stakesOther[msg.sender].push(StakesOtherToken(block.timestamp, _amount));
        balances[msg.sender].balanceOtherToken += _amount;

        emit StakeOtherToken (_amount, _tokenAddress);
    }

    /// @notice Withdraw de l'USDC
    /// @notice Pour faire en sorte que le protocole incite les participants à locker leurs jetons
    /// @notice Le withdraw réinitialise le montant du stake choisi 
    /// @param _amount Le montant d'USDC à withdraw
    /// @param _addressUSDC L'adresse du token USDC
    function withdrawUSDC(uint256 _amount, address _addressUSDC, uint256 _stakeToWithdrawIndex) external {
        require(_amount > 0, "amount = 0");
        require((keccak256(abi.encode(tokensStakable[_addressUSDC].name))) == (keccak256(abi.encode("USDC"))), "NOT USDC");
        require(stakesUSDC[msg.sender][_stakeToWithdrawIndex].amount >= _amount, "Withdraw too high");
        require(stakesUSDC[msg.sender].length < 1000, "");

        balances[msg.sender].balanceUSDC -= _amount;
        IERC20(_addressUSDC).transfer(msg.sender, _amount);
        stakesUSDC[msg.sender][_stakeToWithdrawIndex].amount -= _amount;

        emit WithdrawUSDC (_amount, _addressUSDC, _stakeToWithdrawIndex);
    }

    /// @notice Withdraw un token enregistré comme stakable
    /// @notice Pour faire en sorte que le protocole incite les participants à locker leurs jetons
    /// @notice Le withdraw réinitialise le montant du stake choisi 
    /// @param _amount Le montant du token à withdraw
    /// @param _tokenAddress L'adresse du token 
    function withdrawOtherToken(uint256 _amount, address _tokenAddress, uint256 _stakeToWithdrawIndex) external {
        require(_amount > 0, "amount = 0");
        require(tokensStakable[_tokenAddress].isStakable = true, "Not stakable");
        require(stakesOther[msg.sender][_stakeToWithdrawIndex].amount >= _amount, "Withdraw too high");
        require(stakesOther[msg.sender].length < 1000, "");

        balances[msg.sender].balanceOtherToken -= _amount;
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
        stakesOther[msg.sender][_stakeToWithdrawIndex].amount -= _amount;

        emit WithdrawOtherToken (_amount, _tokenAddress, _stakeToWithdrawIndex);
    }

    /// @notice Récupère la valeur de l'USDC en USD sur SEPOLIA
    /// @return uint256 La valeur de l'USDC en USD
    function getUSDCValueChainLink() public view returns (uint256) {
        (, int price,,,) = priceFeedUSDC.latestRoundData();
        return (uint256(price) * 1e10 / numerateur);
    }

    /// @notice Récupère la valeur du token en USD sur SEPOLIA
    /// @param _chainlinkAddress L'adresse Chainlink correspondante à la pair token/USD
    /// @return uint256 La valeur du token en USD
    function getOtherValueChainLink(address _chainlinkAddress) public view returns (uint256) {
        AggregatorV3Interface priceFeedOtherToken = AggregatorV3Interface(_chainlinkAddress);
        (, int price,,,) = priceFeedOtherToken.latestRoundData();
        return (uint256(price) * 1e10 / numerateur);
    }

    /// @notice Calcul de la valeur en USD des stakes USDC du staker
    /// @return uint256 La valeur en USD des stakes USDC de l'appelant de la fonction
    function stakesValueUSDC() public view returns (uint256) {
        uint256 stakesValueUsdc;
        for(uint256 i=0; i < stakesUSDC[msg.sender].length; i++) {
            stakesValueUsdc += ((stakesUSDC[msg.sender][i].date - block.timestamp) / (rewardRateUSDC) * (stakesUSDC[msg.sender][i].amount));
        }
        return (stakesValueUsdc * getUSDCValueChainLink());
    }

    /// @notice Calcul de la valeur en USD des stakes des autres tokens du staker
    /// @param _chainlinkAddress L'adresse Chainlink correspondante à la pair token/USD
    /// @return uint256 La valeur en USD des stakes des autres tokens de l'appelant de la fonction
    function stakesValueOtherToken(address _chainlinkAddress) public view returns (uint256) {
        uint256 stakesValueOther;
        for(uint256 i=0; i < stakesOther[msg.sender].length; i++) {
            stakesValueOther += ((stakesOther[msg.sender][i].date - block.timestamp) / (rewardRateOtherToken) * (stakesOther[msg.sender][i].amount));
        }
        return (stakesValueOther * getOtherValueChainLink(_chainlinkAddress));
    }

    /// @notice Calcul de la valeur en USD des rewards du staker
    /// @param _chainlinkAddress L'adresse Chainlink correspondante à la pair token/USD
    /// @return uint256 La valeur en USD des rewards de l'appelant de la fonction
    function calculateRewards(address _chainlinkAddress) public view returns (uint256) {
        return (stakesValueUSDC() + stakesValueOtherToken(_chainlinkAddress));
    }

    /// @notice Envoie les rewards au staker et au projet Agricole avec un taux de partage de 50%
    /// @param _projectAgriculteur L'adresse du projet agricole que le staker souhaite financer
    /// @param _chainlinkAddress L'address Chainlink correspondante à la pair token/USD
    function getRewardAndSupportProject(address _projectAgriculteur, address _chainlinkAddress) external {
        uint256 rewards = calculateRewards(_chainlinkAddress);
        for(uint256 i=0; i < stakesUSDC[msg.sender].length; i++) {
            stakesUSDC[msg.sender][i].date = 0;
        }
        for(uint256 i=0; i < stakesOther[msg.sender].length; i++) {
            stakesOther[msg.sender][i].date = 0;
        }     
        if (rewards > 0) {
            uint256 rewardsForProject = rewards/2;
            uint256 rewardsForStaker = rewards/2;
            rewardsToken.transfer(_projectAgriculteur, rewardsForProject);
            rewardsToken.transfer(msg.sender, rewardsForStaker);
        }  
    }
}