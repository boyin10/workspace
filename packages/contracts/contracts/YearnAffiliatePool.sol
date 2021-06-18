// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AffiliateToken.sol";

interface ThreeCrv is IERC20 {}

interface CrvLPToken is IERC20 {}

contract Pool is AffiliateToken, Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for ThreeCrv;
  using SafeERC20 for CrvLPToken;

  ThreeCrv public threeCrv;
  CrvLPToken public crvLPToken;
  address public rewardsManager;

  uint256 constant BPS_DENOMINATOR = 10_000;
  uint256 constant SECONDS_PER_YEAR = 31_556_952;

  uint256 public withdrawalFee = 50;
  uint256 public managementFee = 200;
  uint256 public performanceFee = 2000;
  uint256 public poolTokenHWM = 1e18;
  uint256 public feesUpdatedAt;

  event Deposit(address indexed from, uint256 deposit, uint256 poolTokens);
  event Withdrawal(address indexed to, uint256 amount);
  event WithdrawalFee(address indexed to, uint256 amount);
  event PerformanceFee(uint256 amount);
  event ManagementFee(uint256 amount);
  event WithdrawalFeeChanged(uint256 previousBps, uint256 newBps);
  event ManagementFeeChanged(uint256 previousBps, uint256 newBps);
  event PerformanceFeeChanged(uint256 previousBps, uint256 newBps);

  constructor(
    address threeCrv_,
    address rewardsManager_
  ) public AffiliateToken(threeCrv_, address(0), "Popcorn 3Crv Pool", "pop3Crv") {
    require(address(threeCrv_) != address(0));
    require(rewardsManager_ != address(0));

    threeCrv = ThreeCrv(threeCrv_);
    rewardsManager = rewardsManager_;
    feesUpdatedAt = block.timestamp;
  }

  function deposit(uint256 amount) public override nonReentrant returns (uint256) {
    _takeFees();

    uint256 deposited = super.deposit(amount);

    emit Deposit(msg.sender, amount, deposited);
    _reportPoolTokenHWM();
    return deposited;
  }

  function withdraw(uint256 amount)
    public 
    override
    nonReentrant
    returns (uint256)
  {
    require(amount <= balanceOf(msg.sender), "Insufficient pool token balance");

    _takeFees();

    _burn(msg.sender, amount);
    uint256 totalWithdrawal = _shareValue(amount);
    uint256 fee = _calculateWithdrawalFee(totalWithdrawal);
    uint256 withdrawal = amount.sub(fee);
    _withdraw(address(this), msg.sender, withdrawal, true);
    _withdraw(address(this), rewardsManager, fee, true);

    _reportPoolTokenHWM();
    
    return (withdrawal);
  }

  function takeFees() external nonReentrant {
    _takeFees();
    _reportPoolTokenHWM();
  }

  function setWithdrawalFee(uint256 withdrawalFee_) external onlyOwner {
    require(withdrawalFee != withdrawalFee_, "Same withdrawalFee");
    uint256 _previousWithdrawalFee = withdrawalFee;
    withdrawalFee = withdrawalFee_;
    emit WithdrawalFeeChanged(_previousWithdrawalFee, withdrawalFee);
  }

  function setManagementFee(uint256 managementFee_) external onlyOwner {
    require(managementFee != managementFee_, "Same managementFee");
    uint256 _previousManagementFee = managementFee;
    managementFee = managementFee_;
    emit ManagementFeeChanged(_previousManagementFee, managementFee);
  }

  function setPerformanceFee(uint256 performanceFee_) external onlyOwner {
    require(performanceFee != performanceFee_, "Same performanceFee");
    uint256 _previousPerformanceFee = performanceFee;
    performanceFee = performanceFee_;
    emit PerformanceFeeChanged(_previousPerformanceFee, performanceFee);
  }

  function withdrawAccruedFees() external onlyOwner {
    _withdraw(address(this), rewardsManager, balanceOf(address(this)), true);
  }

  function pricePerPoolToken() public view returns (uint256) {
    return valueFor(1e18);
  }

  function totalValue() public view returns (uint256) {
    return _totalValue();
  }

  function valueFor(uint256 poolTokens) public view returns (uint256) {
    return _shareValue(poolTokens);
  }

  function _totalValue() internal view returns (uint256) {
    return totalVaultBalance(address(this)); 
  }

  function _reportPoolTokenHWM() internal {
    if (pricePerPoolToken() > poolTokenHWM) {
      poolTokenHWM = pricePerPoolToken();
    }
  }

  function _issuePoolTokensForAmount(address to, uint256 amount)
    internal
    returns (uint256)
  {
    uint256 tokens = 0;
    if (totalSupply() > 0) {
      tokens = amount.mul(1e18).div(pricePerPoolToken());
    } else {
      tokens = amount;
    }
    return _issuePoolTokens(to, tokens);
  }

  function _takeManagementFee() internal {
    uint256 period = block.timestamp.sub(feesUpdatedAt);
    uint256 fee =
      (managementFee.mul(totalValue()).mul(period)).div(
        SECONDS_PER_YEAR.mul(BPS_DENOMINATOR)
      );
    if (fee > 0) {
      _issuePoolTokensForAmount(address(this), fee);
      emit ManagementFee(fee);
    }
  }

  function _takePerformanceFee() internal {
    if (pricePerPoolToken() > poolTokenHWM) {
      uint256 changeInPricePerToken = pricePerPoolToken().sub(poolTokenHWM);
      uint256 fee =
        performanceFee
          .mul(changeInPricePerToken)
          .mul(totalSupply())
          .div(BPS_DENOMINATOR)
          .div(1e18);
      _issuePoolTokensForAmount(address(this), fee);
      emit PerformanceFee(fee);
    }
  }

  function _takeFees() internal {
    _takeManagementFee();
    _takePerformanceFee();
    feesUpdatedAt = block.timestamp;
  }

  function _calculateWithdrawalFee(uint256 withdrawalAmount)
    internal
    view
    returns (uint256)
  {
    return withdrawalAmount.mul(withdrawalFee).div(BPS_DENOMINATOR);
  }

  function _transferWithdrawalFee(uint256 fee) internal {
    _transferThreeCrv(rewardsManager, fee);
    emit WithdrawalFee(rewardsManager, fee);
  }

  function _transferWithdrawal(uint256 withdrawal) internal {
    _transferThreeCrv(msg.sender, withdrawal);
    emit Withdrawal(msg.sender, withdrawal);
  }

  function _transferThreeCrv(address to, uint256 amount) internal {
    threeCrv.safeIncreaseAllowance(address(this), amount);
    threeCrv.safeTransferFrom(address(this), to, amount);
  }

  function _poolShareFor(uint256 poolTokenAmount)
    internal
    view
    returns (uint256)
  {
    if (totalSupply() == 0) {
      return 1e18;
    }
    return poolTokenAmount.mul(1e18).div(totalSupply());
  }

  function _issuePoolTokens(address to, uint256 amount)
    internal
    returns (uint256)
  {
    _mint(to, amount);
    return amount;
  }

  function _burnPoolTokens(address from, uint256 amount)
    internal
    returns (uint256)
  {
    _burn(from, amount);
    return amount;
  }

  // function _withdrawPoolTokens(address fromAddress, uint256 amount)
  //   internal
  //   returns (uint256)
  // {
  //   uint256 yvShareWithdrawal = _yearnSharesFor(amount);
  //   _burnPoolTokens(fromAddress, amount);
  //   uint256 crvLPTokenAmount = _withdrawFromYearn(yvShareWithdrawal);
  //   return _withdrawFromCurve(crvLPTokenAmount);
  // }
}