// @ts-ignore 
import { ethers } from "hardhat"
import verify from "../helper-functions"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

const deployGToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("logging-------------------------------------------------")
    log("Deploying GToken and waiting for confirmation...........")

    const gToken = await deploy("GToken", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1
    })
    log(`Deployed GToken to ${gToken.address}`)
    
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(gToken.address, [])
    }
    log(`Delegating to ${deployer}`)
    await delegate(gToken.address, deployer)
    log("Delegated!")
}

const delegate = async (gTokenAddress: string, delegatedAccount: string) => {
    const gToken = await ethers.getContractAt("GToken", gTokenAddress)
    const transactionResponse = await gToken.delegate(delegatedAccount)
    await transactionResponse.wait(1)
    console.log(`Checkpoints: ${await gToken.numCheckpoints(delegatedAccount)}`)
}

export default deployGToken
deployGToken.tags = ["all", "governor"]
