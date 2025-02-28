// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title UserAesthetics
 * @dev A contract for managing user aesthetic preferences and personal details
 */
contract UserAesthetics {
    struct AestheticsData {
        string[] aesthetics;
        bool isSet;
        uint256 lastUpdated;
    }

    struct UserProfile {
        string name;
        string phone;
        string email;
        string location;
        bool isProfileSet;
        uint256 profileLastUpdated;
    }

    mapping(address => AestheticsData) private userAesthetics;
    mapping(address => UserProfile) private userProfiles;

    event AestheticsUpdated(
        address indexed user,
        string[] aesthetics,
        uint256 timestamp
    );

    event ProfileUpdated(
        address indexed user,
        string name,
        string phone,
        string email,
        string location,
        uint256 timestamp
    );

    event ProfileDeleted(address indexed user, uint256 timestamp);

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
        if (!data.isSet) {
            return (new string[](0), false, 0);
        }
        return (data.aesthetics, data.isSet, data.lastUpdated);
    }

    /**
     * @dev Deletes a user's aesthetic preferences
     */
    function deleteUserAesthetics() external {
        delete userAesthetics[msg.sender];
        emit AestheticsUpdated(msg.sender, new string[](0), block.timestamp);
    }

    /**
     * @dev Sets or updates a user's profile information
     * @param name User's name
     * @param phone User's phone number
     * @param email User's email address
     * @param location User's location
     */
    function setUserProfile(
        string calldata name,
        string calldata phone,
        string calldata email,
        string calldata location
    ) external {
        userProfiles[msg.sender] = UserProfile({
            name: name,
            phone: phone,
            email: email,
            location: location,
            isProfileSet: true,
            profileLastUpdated: block.timestamp
        });

        emit ProfileUpdated(
            msg.sender,
            name,
            phone,
            email,
            location,
            block.timestamp
        );
    }

    /**
     * @dev Gets a user's profile information
     * @param user Address of the user
     * @return name User's name
     * @return phone User's phone number
     * @return email User's email address
     * @return location User's location
     * @return isProfileSet Boolean indicating if user has set their profile
     * @return profileLastUpdated Timestamp of when profile was last updated
     */
    function getUserProfile(
        address user
    )
        external
        view
        returns (
            string memory name,
            string memory phone,
            string memory email,
            string memory location,
            bool isProfileSet,
            uint256 profileLastUpdated
        )
    {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.name,
            profile.phone,
            profile.email,
            profile.location,
            profile.isProfileSet,
            profile.profileLastUpdated
        );
    }

    /**
     * @dev Deletes a user's profile information
     */
    function deleteUserProfile() external {
        delete userProfiles[msg.sender];
        emit ProfileDeleted(msg.sender, block.timestamp);
    }

    /**
     * @dev Updates specific fields of a user's profile
     * @param fieldName The name of the field to update (name, phone, email, location)
     * @param value The new value for the field
     */
    function updateProfileField(
        string calldata fieldName,
        string calldata value
    ) external {
        UserProfile storage profile = userProfiles[msg.sender];

        // If profile doesn't exist yet, create an empty one
        if (!profile.isProfileSet) {
            profile.isProfileSet = true;
        }

        // Update the specified field
        if (keccak256(bytes(fieldName)) == keccak256(bytes("name"))) {
            profile.name = value;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("phone"))) {
            profile.phone = value;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("email"))) {
            profile.email = value;
        } else if (
            keccak256(bytes(fieldName)) == keccak256(bytes("location"))
        ) {
            profile.location = value;
        } else {
            revert("Invalid field name");
        }

        // Update timestamp
        profile.profileLastUpdated = block.timestamp;

        // Emit event with all current values
        emit ProfileUpdated(
            msg.sender,
            profile.name,
            profile.phone,
            profile.email,
            profile.location,
            block.timestamp
        );
    }
}
