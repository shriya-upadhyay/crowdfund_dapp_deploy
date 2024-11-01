# Crowdfunding dApp

### Environment Setup

- Fork the repo at https://github.com/BlockchainUSC/Spring-2023-Build-Night-2
- Navigate to the folder where you want to store your repo in your terminal
- Clone the repo by typing `git clone <URL>`, where `<URL>` is the link that appears after hitting the green **Code** button in the top right of your repo.


### Getting Started
- Open the folder that contains the repo for Build Night 2 in Visual Studio Code (or your preferred IDE)
- Create a new Terminal window by hitting terminal in the top left and clicking new terminal
- Navigate to the Build Night 2 folder in terminal
- Type in the command: `cd start` to enter the starting code directory
- Create a new folder called blockchain: `mkdir blockchain`
- Navigate to the blockchain folder: `cd blockchain`

### Setting up Hardhat
- Run the command `npm install -d hardhat@latest @nomicfoundation/hardhat-ethers ethers@6.1.0`
  - Installs Hardhat, Hardhat plugin for ethers.js, and the ethers.js library
- Run the command: `npx hardhat init`
  - Select Typescript Project 
  - project root is the current directory (hit enter)
  - add gitignore: y 
  - Install this sample project’s dependencies with npm: y

### What is Crowdfunding?
- **Crowdfunding**: a way to raise funds from a large number of people/entities to support a business, project, or even a concept
- Terminology 
  - **Campaign**: Specific fundraising project (includes cause, timeline, and goal)
  - **Pledge**: An action by a backer to commit money to a campaign 
  - **Goal**: Target amount of money campaign aims to raise 
  - **Claim**: Creator of the campaign ends the campaign and withdraws the pledged funds to use on the project 
  - **Refund**: If a campaign fails or is cancelled, refund is used to return money to the backers who pledged money to the campaign

### Crowdfund Smart Contract
- Inside of blockchain/contracts, delete Lock.sol and create a file called CrowdFund.sol  and copy the following code into the file:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract CrowdFund {
    event Launch(
        uint id,
        address indexed creator,
        uint goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint id, address indexed caller, uint amount);
```


### Campaign Struct

Copy the following code into the file:

```solidity
struct Campaign {
        // Creator of campaign
        address creator;
        // Amount of tokens to raise
        uint goal;
        // Total amount pledged
        uint pledged;
        // Timestamp of start of campaign
        uint32 startAt;
        // Timestamp of end of campaign
        uint32 endAt;
        // True if goal was reached and creator has claimed the tokens.
        bool claimed;
    }
```

A **struct** is a way to define your own data type or record of data.

We are creating a campaign struct to record data about a campaign including:
- Address of the creator 
- The goal 
- The amount pledged so far 
- The starting time 
- The ending time 
- If the creator has claimed the pledged funds and ended the campaign

### Contract State Variables
Copy the following code into the file:

```solidity
uint public count;

// Mapping from id to Campaign
mapping(uint => Campaign) public campaigns;

// Mapping from campaign id => pledger => amount pledged
mapping(uint => mapping(address => uint)) public pledgedAmount;

constructor() {
}

```

These are our contract’s **state** variables: their values are permanently stored in a contract storage rather than a specific function
- The count variable keeps track of # of campaigns created 
- The second is a map of key: type unsigned int to value: Campaign (the struct we defined earlier). Mapping campaign ids to campaigns in a public hashmap meaning it can be accessed by the contract internally and externally by users

### Launch Function
Copy the following code into the file:

```solidity
function launch(uint _goal, uint32 _startAt, uint32 _endAt) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        count += 1;
        campaigns[count] = Campaign({
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });

        emit Launch(count, msg.sender, _goal, _startAt, _endAt);
    }

```
Create a function launch that takes in the goal, start_time, and end_time for a campaign
- **External**: the function can be called by transactions or calls outside of the contract (whereas public can be invoked both inside and outside of the contract)
- The **'require'** lines are validity checks:
  - Ensure that the start time for the contract must be before or after the current time
  - Ensure that the end time is after the starting time
  - Ensure that the end time is less than or equal to 90 days after the current time
  - Increment the count state variable (to reflect the updated number of campaigns 
  - Update our campaigns hashmap using the campaign id from count as the key, the value is a new struct with its data members initialized using arguments from function

_Notes_
- msg.sender is a global variable that refers to the address of the account or wallet that called the current function 
- Emitting the launch event logs the creation of the campaign including campaign id, address of creator, goal and start and end times

### Cancel Function
Copy the following code into the file:
```solidity
function cancel(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");

        delete campaigns[_id];
        emit Cancel(_id);
    }
```

Create a function cancel that takes in the campaign id for the campaign
- **External**: the function can be called by transactions or calls outside of the contract (whereas public can be invoked both inside and outside of the contract)
- Find the campaign from the state variable of campaign mapping from id to campaign and store it in the campaign variable, the memory keyword specifies that it is a temporary variable as opposed to a state variable which is permanent 
- The **‘require’** lines are validity checks:
  - Ensure that the address calling the cancel function is the address that created the campaign 
  - Ensure that the campaign has not started yet
- Delete the campaign struct associated with that id from the campaigns map (state variable)
- It doesn’t actual delete the struct (unlike C++), rather it sets all of the data members to 0 so if you try to access it, you will see a campaign struct with all values set to 0 
- Emitting the cancel event logs the cancellation of the campaign including campaign id

### Pledge Function
Copy the following code into the file:

```solidity
function pledge(uint _id) external payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged += msg.value;
        pledgedAmount[_id][msg.sender] += msg.value;

        emit Pledge(_id, msg.sender, msg.value);
    }
```
Create a function pledge that takes in the campaign id for the campaign
- **External**: the function can be called by transactions or calls outside of the contract (whereas public can be invoked both inside and outside of the contract)
- **Payable**: the function can receive Ether (without this keyword any attempt to send ether to function will throw error)
- Find the campaign from the state variable of campaign mapping from id to campaign and store it in the campaign variable, the storage keyword specifies that it is permanent
- The **‘require’** lines are validity checks:
  - Ensure that the current time is after the start time of the contract
  - Ensure that the current time is before the end time of the contract
- Increment the pledged data member of the respective campaign by the value pledged by the address that called the pledge function 
- Also update the pledge amount state variable map, access the hashmap associated with the campaign’s id and increment the amount that the address has pledged by the value that address pledged 
- Emitting the Pledge event logs the new pledge to the campaign including campaign id, pledger address, and pledged amount

### Unpledge Function
Copy the following code into the file:

```solidity
function unpledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.endAt, "ended");
        require(pledgedAmount[_id][msg.sender] >= _amount, "cannot unpledge more than pledged amount");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit Unpledge(_id, msg.sender, _amount);
    }

```

- Create a function unpledge that takes in the campaign id for the campaign, and amount to unpledge
- **External**: the function can be called by transactions or calls outside of the contract (whereas public can be invoked both inside and outside of the contract)
- Find the campaign from the state variable of campaign mapping from id to campaign and store it in the campaign variable, the storage keyword specifies that it is permanent
- The **‘require’** lines are validity checks:
  - Ensure that the current time is before the end time of the contract
  - Ensure that the address is not trying to unpledge more than they pledged
- Decrement the pledged data member of the respective campaign by the value “unpledged” by the address that called the unpledge function
- **Payable** means we can send ETH to the msg.sender (the address that called the unpledge function), and transfer allows us to transfer that amount to the address’ wallet
- Also update the pledge amount state variable map, access the hashmap associated with the campaign’s id and decrement the amount that the address has pledged by the value that address “unpledged “
- Emitting the Unpledge event logs the new pledge to the campaign including campaign id, pledger address, and unpledged amount


### Claim Function
Copy the following code into the file:

```solidity
function claim(uint _id) external {
        Campaign storage campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed");

        campaign.claimed = true;
        payable(msg.sender).transfer(campaign.pledged);

        emit Claim(_id);
    }
```

Create a function claim that takes in the campaign id for the campaign
- **External**: the function can be called by transactions or calls outside of the contract (whereas public can be invoked both inside and outside of the contract)
- Find the campaign from the state variable of campaign mapping from id to campaign and store it in the campaign variable, the storage keyword specifies that it is permanent
- The **‘require’** lines are validity checks:
  - Ensure the address calling the function is the creator of the campaign
  - Ensure that the current time is after the end time of the campaign
  - Ensure that the amount pledged to the campaign is at least equal to the goal
  - Ensure the the campaign has not already been claimed 
- Update the campaign’s claimed data member to true (it is being claimed)
- **Payable** means we can send ETH to the msg.sender (the address that called the claim function), and transfer allows us to transfer that amount to the address’ wallet 
- Emitting the Claim event logs the new claim of the campaign including campaign id

### Get Campaign Function
Copy the following code into the file:

```solidity
function getCampaign(uint _id) external view returns(address creator,
        uint goal,
        uint pledged,
        uint32 startAt,
        uint32 endAt,
        bool claimed) {

            Campaign memory campaign = campaigns[_id];

            return (campaign.creator, campaign.goal, campaign.pledged, campaign.startAt, campaign.endAt, campaign.claimed);
    }

```

Create a function campaign that takes in the campaign id for the campaign
- **External**: the function can be called by transactions or calls outside of the contract (whereas public can be invoked both inside and outside of the contract)
- **View**: can read data from the contract/blockchain but cannot modify
- **Returns**: specifies the return type of the function
- Find the campaign from the state variable of campaign mapping from id to campaign and store it in the campaign variable, the memory keyword specifies that it is temporary
- Return all of the data members of the Campaign struct


### Update hardhat.config.ts
Update the config function to below code (we will add the endpoint URL Later):
```solidity
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const Private_Key = "YOUR_PRIVATE_KEY";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: `YOUR_RPC_URL_ENDPOINT`,
      accounts: [`0x${Private_Key}`],
    },
  },
};

export default config;

```
*Inside of hardhat.config.ts, add your private key as a string (enclose it in quotes)*

Follow [slides](https://docs.google.com/presentation/d/1xdg0rA4LAnQ_z0KawWPDZ7PYjTHXLxOPf_et7FiCZI8/edit?usp=sharing) for instructions on how to get Sepolia Test ETH, create Alchemy RPC Endpoint, and access your private key.

### Deploy Script

Create a folder called **scripts** within the blockchain folder and  add a file to it called deploy.ts

Copy the following code into it: 

```solidity
// scripts/deploy.ts

import { ethers } from "hardhat";

async function main () {
  // We get the contract to deploy
  const crowdfund = await ethers.deployContract("CrowdFund");

 console.log('Deploying Contract...');
 //Program waits until counter is deployed before moving onto next line of code
 await crowdfund.waitForDeployment();

 //prints the countract's target, its address on the blockchain
console.log(`Crowdfund deployed to: ${crowdfund.target}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

### Run and Deploy Smart Contract
Run `npx hardhat compile` to compile the smart contract

Run `npx hardhat run scripts/deploy.ts --network sepolia` to run the script to deploy the smart contract

You should see an output like: 

>Counter deployed to: 0x75F7921BB70b3C6c0e88a0808C335F9d369fEbC3

You can view your transaction at https://sepolia.etherscan.io/ by copy pasting the address into the search bar

**_Save_** your address, we’ll use it again later!


## Integrate with Frontend













Notion: 
-   https://blockchain-usc.notion.site/Spring-23-Build-Nights-e091ae838f7d447d8fce9740a0f9c1c2