// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title UserAesthetics
 * @dev A contract for managing user aesthetic preferences
 */
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

    /**
     * @dev Sets a user's aesthetic preferences
     * @param aesthetics Array of aesthetic preferences
     */
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

    /**
     * @dev Gets a user's aesthetic preferences
     * @param user Address of the user
     * @return aesthetics Array of user's aesthetic preferences
     * @return isSet Boolean indicating if user has set aesthetics
     * @return lastUpdated Timestamp of when aesthetics were last updated
     */
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

    /**
     * @dev Deletes a user's aesthetic preferences
     */
    function deleteUserAesthetics() external {
        require(userAesthetics[msg.sender].isSet, "Aesthetics not set");
        delete userAesthetics[msg.sender];
        emit AestheticsUpdated(msg.sender, new string[](0), block.timestamp);
    }
}
