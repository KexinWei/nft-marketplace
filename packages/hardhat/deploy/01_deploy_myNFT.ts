import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployMyNFTCollection: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying MyNFTCollection with account:", deployer);

  await deploy("MyNFTCollection", {
    from: deployer,
    args: ["MyNFTCollection", "MNFT"],
    log: true,
  })
    .then((deployment) => console.log(`MyNFTCollection deployed at ${deployment.address}`))
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });
};

export default deployMyNFTCollection;
deployMyNFTCollection.tags = ["MyNFTCollection"];
