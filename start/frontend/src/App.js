import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import fundme from "./CrowdFund.json";

function App() {
  const [currentAccount, setCurrentAccount] = useState();
  const [contract, setContract] = useState();
  const contractAddress = "0x322d9b7df9DF4d634017A6789faC61B2a3015f92";
  let signer;
  const [camp, setCamp] = useState([-1]);
  const [claimId, setClaimId] = useState("");
  const [pledgeId, setPledgeId] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [viewModle, setViewModle] = useState(false);
  const [makeModle, setMakeModle] = useState(false);
  const [startBlock, setStartBlock] = useState("");
  const [endBlock, setEndBlock] = useState("");
  const [goal, setGoal] = useState("");
  const [campaign, setCampaign] = useState({
    id: -1,
    startBlock: -1,
    endBlock: -1,
    goal: -1,
    totalPledged: -1,
  });

  // We need to change these 4 functions to use the new contract

  const handleCreate = async (e) => {
    e.preventDefault();
    // we need to create a campaign
    if (contract == undefined) {
      return;
    }
    // get the current time in unix epoch value and add the minutes entered by the user
    let start = parseInt(Date.now() / 1000 + 60 * startBlock);
    let finish = parseInt(Date.now() / 1000 + 60 * endBlock);
    let launchGoal = ethers.utils.parseEther(goal);

    const tx = await contract.launch(launchGoal, start, finish);

    await tx.wait();

    setStartBlock("");
    setEndBlock("");
    setGoal("");
  };

  const handlePledge = async (e) => {
    e.preventDefault();
    await onClickConnect();
    // we need to pledge funds to the campaign
    if (contract == undefined) {
      return;
    }
    const options = { value: ethers.utils.parseEther(pledgeAmount) };
    await contract.pledge(pledgeId, options);

    setPledgeAmount("");
    setPledgeId("");
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    await onClickConnect();
    // we need to claim the funds from the campaign
    if (contract == undefined) {
      return;
    }
    await contract.claim(claimId);

    setClaimId("");
  };

  const handleView = async (e) => {
    e.preventDefault();
    if (viewModle == true) {
      setViewModle(!viewModle);
      return;
    }
    if (claimId < 0 || claimId == "" || contract == undefined) {
      alert("Please enter a valid campaign ID");
      return;
    }
    // We need to get the campaign from the blockchain and save it to campaign state
    let camp = await contract.campaigns(claimId);
    setCampaign({
      id: claimId,
      startBlock: camp[3],
      endBlock: camp[4],
      goal: ethers.utils.formatEther(camp[1]),
      totalPledged: ethers.utils.formatEther(camp[2]),
      claimed: camp[5],
    });

    setViewModle(!viewModle);
    setClaimId("");
  };

  const onClickConnect = async () => {
    if (!window.ethereum) {
      alert("please install MetaMask");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider
        .send("eth_requestAccounts", [])
        .then((accounts) => {
          if (accounts.length > 0) setCurrentAccount(accounts[0]);
        })
        .catch((e) => console.log(e));

    signer = provider.getSigner();

    setContract(
        new ethers.Contract(contractAddress, fundme.abi, signer)
    );
  };

  return (
    <div className="App">
      <body className="App-header from-gray-900 to-gray-600 bg-gradient-to-b">
        {/* Dapp Buttons */}

        <div className="my-10">
          <div>
            <button
              onClick={() => {
                setMakeModle(!makeModle);
              }}
              className="my-6 mx-4 rounded-2xl py-4 px-6 bg-gradient-to-r from-blue-600 to-violet-600 text-lg"
            >
              Create Campaign
            </button>
          </div>
          <div>
            {makeModle && (
              <div className="my-6 mx-8 rounded-2xl py-6 px-10 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-xl ">
                <form
                  onSubmit={handleCreate}
                  className="flex flex-col gap-5 text-start"
                >
                  <label>
                    Minutes Start
                    <input
                      type="text"
                      value={startBlock}
                      onChange={(e) => setStartBlock(e.target.value)}
                      className="ml-2 rounded-2xl py-1 px-4 text-black h-10 "
                    />
                  </label>
                  <label>
                    Minutes End
                    <input
                      type="text"
                      value={endBlock}
                      onChange={(e) => setEndBlock(e.target.value)}
                      className="ml-2 rounded-2xl py-1 px-4 text-black h-10"
                    />
                  </label>
                  <label>
                    Goal in Eth
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="ml-2 rounded-2xl py-1 px-4 text-black h-10"
                    />
                  </label>
                  <button
                    type="submit"
                    className="bg-gray-600 hover:bg-gray-700 w-32 w-full rounded-2xl mx-auto py-2"
                  >
                    Create
                  </button>
                </form>
              </div>
            )}
            {viewModle && (
              <div className="my-6 mx-8 rounded-2xl py-6 px-10 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-xl font-semibold">
                <div className="font-bold text-2xl">ID: {campaign.id}</div>
                <div className="flex flex-row gap-12 justify-center my-4">
                  <div>Start Block: {campaign.startBlock}</div>
                  <div>End Block: {campaign.endBlock}</div>
                </div>

                <div className="my-4">Goal: {campaign.goal}</div>
                <div className="my-4">
                  Total Pledged: {campaign.totalPledged}
                </div>
                <div className="my-4">
                  Claimed: {campaign.claimed ? "Yes" : "No"}
                </div>
              </div>
            )}
          </div>
          <div className="my-6 mx-8 rounded-2xl py-6 px-10 bg-gradient-to-r from-blue-600 to-violet-600 text-xl">
            <form
              onSubmit={handlePledge}
              className="flex flex-col gap-5 text-start"
            >
              <label>
                Campaign ID:
                <input
                  type="text"
                  value={pledgeId}
                  onChange={(e) => setPledgeId(e.target.value)}
                  className="ml-2 rounded-2xl py-1 px-4 text-black h-10"
                />
              </label>
              <label>
                Eth Value:
                <input
                  type="text"
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(e.target.value)}
                  className="ml-2 rounded-2xl py-1 px-4 text-black h-10"
                />
              </label>
              <button
                type="submit"
                className="bg-gray-600 hover:bg-gray-700 w-32 w-full rounded-2xl mx-auto py-2"
              >
                Pledge
              </button>
            </form>
          </div>

          <div className="my-6 mx-8 rounded-2xl py-6 px-10 bg-gradient-to-r from-blue-600 to-violet-600 text-xl">
            <form onSubmit={handleClaim} className="flex flex-col gap-5">
              <label>
                Campaign ID:
                <input
                  type="text"
                  value={claimId}
                  onChange={(e) => setClaimId(e.target.value)}
                  className="ml-2 rounded-2xl py-1 px-4 text-black h-10"
                />
              </label>
              <button
                type="submit"
                className="bg-gray-600 hover:bg-gray-700 w-32 w-full rounded-2xl mx-auto py-2"
              >
                Claim
              </button>
              <button
                onClick={handleView}
                className="bg-gray-600 hover:bg-gray-700 w-60 w-full rounded-2xl mx-auto py-2"
              >
                View Campaign
              </button>
            </form>
          </div>

          <button
            className="mx-8 my-10 rounded-2xl py-1.5 px-8 bg-gray-600 hover:bg-gray-700"
            onClick={onClickConnect}
          >
            {currentAccount ? "Connected" : "Connect Wallet"}
          </button>
        </div>

        {/* Image + Links */}
        <img src={logo} className="App-logo" alt="logo" />
        <div className="flex flex-row gap-8 mb-12">
          <a
            className=""
            href="https://blockchain-usc.notion.site/Spring-23-Build-Nights-e091ae838f7d447d8fce9740a0f9c1c2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notion
          </a>
          <a
            className=""
            href="https://github.com/BlockchainUSC/Spring-2023-Build-Night-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
          <a
            className=""
            href="https://www.blockchainusc.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blockchain@USC
          </a>
        </div>
      </body>
    </div>
  );
}

export default App;
