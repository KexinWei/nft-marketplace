import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployNFTAuction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("NFTAuction", {
    from: deployer,
    args: [],
    log: true,
  })
    .then((deployment) => console.log(`NFTAuction deployed at ${deployment.address}`))
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });
};

export default deployNFTAuction;
deployNFTAuction.tags = ["NFTAuction"];