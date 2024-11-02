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

    uint public count;

// Mapping from id to Campaign
    mapping(uint => Campaign) public campaigns;

// Mapping from campaign id => pledger => amount pledged
    mapping(uint => mapping(address => uint)) public pledgedAmount;

    constructor() {
    }

    function launch(uint _goal, uint32 _startAt, uint32 _endAt) external returns (uint id) {
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
        return count;
    }
    function cancel(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");

        delete campaigns[_id];
        emit Cancel(_id);
    }
    function pledge(uint _id) external payable {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged += msg.value;
        pledgedAmount[_id][msg.sender] += msg.value;

        emit Pledge(_id, msg.sender, msg.value);
    }
    function unpledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.endAt, "ended");
        require(pledgedAmount[_id][msg.sender] >= _amount, "cannot unpledge more than pledged amount");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit Unpledge(_id, msg.sender, _amount);
    }
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
    function getCampaign(uint _id) external view returns(address creator,
        uint goal,
        uint pledged,
        uint32 startAt,
        uint32 endAt,
        bool claimed) {

        Campaign memory campaign = campaigns[_id];

        return (campaign.creator, campaign.goal, campaign.pledged, campaign.startAt, campaign.endAt, campaign.claimed);
    }
}