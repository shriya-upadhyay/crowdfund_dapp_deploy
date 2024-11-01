# Crowdfunding dApp

## Environment Setup

- Fork the repo at https://github.com/BlockchainUSC/Spring-2023-Build-Night-2
- Navigate to the folder where you want to store your repo in your terminal
- Clone the repo by typing `git clone <URL>`, where `<URL>` is the link that appears after hitting the green **Code** button in the top right of your repo.


## Getting Started
- Open the folder that contains the repo for Build Night 2 in Visual Studio Code (or your preferred IDE)
- Create a new Terminal window by hitting terminal in the top left and clicking new terminal
- Navigate to the Build Night 2 folder in terminal
- Type in the command: `cd start` to enter the starting code directory
- Create a new folder called blockchain: `mkdir blockchain`
- Navigate to the blockchain folder: `cd blockchain`

## Setting up Hardhat
- Run the command `npm install -d hardhat@latest @nomicfoundation/hardhat-ethers ethers@6.1.0`
  - Installs Hardhat, Hardhat plugin for ethers.js, and the ethers.js library
- Run the command: `npx hardhat init`
  - Select Typescript Project 
  - project root is the current directory (hit enter)
  - add gitignore: y 
  - Install this sample project’s dependencies with npm: y

## What is Crowdfunding?
- **Crowdfunding**: a way to raise funds from a large number of people/entities to support a business, project, or even a concept
- Terminology 
  - **Campaign**: Specific fundraising project (includes cause, timeline, and goal)
  - **Pledge**: An action by a backer to commit money to a campaign 
  - **Goal**: Target amount of money campaign aims to raise 
  - **Claim**: Creator of the campaign ends the campaign and withdraws the pledged funds to use on the project 
  - **Refund**: If a campaign fails or is cancelled, refund is used to return money to the backers who pledged money to the campaign

## Crowdfund Smart Contract
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








Notion: 
-   https://blockchain-usc.notion.site/Spring-23-Build-Nights-e091ae838f7d447d8fce9740a0f9c1c2