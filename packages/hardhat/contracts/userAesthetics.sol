// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserAesthetics {
    struct AestheticsData {
        string[] aesthetics;
        bool isSet;
        uint256 lastUpdated;
    }

    mapping(address => AestheticsData) private userAesthetics;

    event AestheticsUpdated(
        address indexed user,
        string[] aesthetics,
        uint256 timestamp
    );

    function setUserAesthetics(string[] calldata aesthetics) external {
        require(aesthetics.length > 0, "Empty aesthetics not allowed");
        require(aesthetics.length <= 20, "Too many aesthetics"); // Prevent excessive gas costs

        userAesthetics[msg.sender] = AestheticsData({
            aesthetics: aesthetics,
            isSet: true,
            lastUpdated: block.timestamp
        });

        emit AestheticsUpdated(msg.sender, aesthetics, block.timestamp);
    }

    function getUserAesthetics(
        address user
    )
        external
        view
        returns (string[] memory aesthetics, bool isSet, uint256 lastUpdated)
    {
        AestheticsData storage data = userAesthetics[user];
        require(data.isSet, "Aesthetics not set");
        return (data.aesthetics, data.isSet, data.lastUpdated);
    }

    function deleteUserAesthetics() external {
        require(userAesthetics[msg.sender].isSet, "Aesthetics not set");
        delete userAesthetics[msg.sender];
        emit AestheticsUpdated(msg.sender, new string[](0), block.timestamp);
    }
}
