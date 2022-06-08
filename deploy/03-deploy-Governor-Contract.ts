import verify from "../helper-functions"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { networkConfig, developmentChains, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE } from "../helper-hardhat-config"

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const gToken = await get("GToken")
    const timeLock = await get("TimeLock")
    log("logging-------------------------------------------------")
    log("Deploying Governor Contract and waiting for confirmation...........")

    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args: [
            gToken.address,
            timeLock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCENTAGE,
        ],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1
    })
    log(`Deployed GovernorContract to ${timeLock.address}`)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governorContract.address, [])
    }
}

export default deployGovernorContract
deployGovernorContract.tags = ["all", "timelock"]
