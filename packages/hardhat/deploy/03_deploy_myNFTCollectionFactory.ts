import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployMyNFTCollectionFactory: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying MyNFTCollectionFactory with account:", deployer);

  await deploy("MyNFTCollectionFactory", {
    from: deployer,
    args: [],
    log: true,
  })
    .then((deployment) => console.log(`MyNFTCollectionFactory deployed at ${deployment.address}`))
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });
};

export default deployMyNFTCollectionFactory;
deployMyNFTCollectionFactory.tags = ["MyNFTCollectionFactory"];
