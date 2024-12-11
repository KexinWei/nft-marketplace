// deploy/02_deploy_NFTAuction.js
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const nftCollection = await deployments.get("MyNFTCollection");
  
    await deploy("NFTAuction", {
      from: deployer,
      args: [nftCollection.address],
      log: true,
    });
  };
  
  module.exports.tags = ["NFTAuction"];
  