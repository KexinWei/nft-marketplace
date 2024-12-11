// packages/hardhat/deploy/01_deploy_myNFT.js

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log("Deploying MyNFTCollection with account:", deployer);

    await deploy("MyNFTCollection", {
        from: deployer,
        args: [], // 如果你的合约构造函数需要参数，在这里添加
        log: true,
    });
};

module.exports.tags = ["MyNFTCollection"];
  