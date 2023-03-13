-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3002
-- Generation Time: Feb 22, 2023 at 05:37 AM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `modslist`
--

-- --------------------------------------------------------

--
-- Table structure for table `archive_maps`
--

CREATE TABLE `archive_maps` (
  `id` mediumint(5) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL,
  `modID` smallint(5) UNSIGNED NOT NULL,
  `mapperUserID` smallint(5) UNSIGNED DEFAULT NULL,
  `mapperNameString` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `canonicalDifficultyID` smallint(5) UNSIGNED NOT NULL COMMENT 'difficulty assigned when submitting the map, uses celestemods.com''s slightly modified version of the Spring Collab 2020 difficulty system.',
  `lengthID` tinyint(5) UNSIGNED NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `chapter` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'normal maps only',
  `side` enum('A','B','C','D','E') DEFAULT NULL COMMENT 'normal maps only',
  `overallRank` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'contest maps only (overall rank in the contest)',
  `mapRemovedFromModBool` tinyint(1) NOT NULL DEFAULT 0,
  `timeSubmitted` int(11) NOT NULL,
  `submittedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeApproved` int(11) DEFAULT NULL,
  `approvedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeArchived` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `archive_mods`
--

CREATE TABLE `archive_mods` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `modID` smallint(5) UNSIGNED NOT NULL,
  `type` enum('Normal','Collab','Contest','LobbyOther') NOT NULL DEFAULT 'Normal',
  `name` varchar(200) NOT NULL,
  `publisherID` smallint(5) UNSIGNED NOT NULL,
  `contentWarning` tinyint(1) NOT NULL DEFAULT 0,
  `notes` varchar(500) DEFAULT NULL,
  `shortDescription` varchar(150) NOT NULL,
  `longDescription` varchar(1500) DEFAULT NULL,
  `gamebananaModID` mediumint(5) UNSIGNED NOT NULL,
  `timeSubmitted` int(11) NOT NULL,
  `submittedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeApproved` int(11) DEFAULT NULL,
  `approvedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeCreatedGamebanana` int(11) NOT NULL,
  `timeArchived` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `difficulties`
--

CREATE TABLE `difficulties` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `parentDifficultyID` smallint(5) UNSIGNED DEFAULT 0 COMMENT '0 if not a sub-difficulty',
  `order` tinyint(5) UNSIGNED NOT NULL COMMENT '1-indexed. Order within parent mod''s list of difficulties if a full difficulty, or within difficulty if a sub-difficulty. 1 is the easiest.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `difficulties`
--

INSERT INTO `difficulties` (`id`, `name`, `description`, `parentDifficultyID`, `order`) VALUES
(0, 'nullParent', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `lengths`
--

CREATE TABLE `lengths` (
  `id` tinyint(5) UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `description` varchar(100) NOT NULL,
  `order` tinyint(5) UNSIGNED NOT NULL COMMENT 'larger number = longer map. 1 is the shortest.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `maps`
--

CREATE TABLE `maps` (
  `id` mediumint(5) UNSIGNED NOT NULL,
  `modID` smallint(5) UNSIGNED NOT NULL,
  `mapperUserID` smallint(5) UNSIGNED DEFAULT NULL,
  `mapperNameString` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `canonicalDifficultyID` smallint(5) UNSIGNED NOT NULL COMMENT 'difficulty assigned when submitting the map, uses celestemods.com''s slightly modified version of the Spring Collab 2020 difficulty system.',
  `lengthID` tinyint(5) UNSIGNED NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `chapter` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'normal maps only',
  `side` enum('A','B','C','D','E') DEFAULT NULL COMMENT 'normal maps only',
  `overallRank` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'contest maps only (overall rank in the contest)',
  `mapRemovedFromModBool` tinyint(1) NOT NULL DEFAULT 0,
  `timeSubmitted` int(11) NOT NULL,
  `submittedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeApproved` int(11) DEFAULT NULL,
  `approvedBy` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `maps_to_tech`
--

CREATE TABLE `maps_to_tech` (
  `mapID` mediumint(5) UNSIGNED NOT NULL,
  `techID` smallint(5) UNSIGNED NOT NULL,
  `fullClearOnlyBool` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `mods`
--

CREATE TABLE `mods` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `type` enum('Normal','Collab','Contest','LobbyOther') NOT NULL DEFAULT 'Normal',
  `name` varchar(200) NOT NULL,
  `publisherID` smallint(5) UNSIGNED NOT NULL,
  `contentWarning` tinyint(1) NOT NULL DEFAULT 0,
  `notes` varchar(500) DEFAULT NULL,
  `shortDescription` varchar(150) NOT NULL,
  `longDescription` varchar(1500) DEFAULT NULL,
  `gamebananaModID` mediumint(5) UNSIGNED NOT NULL,
  `timeSubmitted` int(11) NOT NULL,
  `submittedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeApproved` int(11) DEFAULT NULL,
  `approvedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeCreatedGamebanana` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `publishers`
--

CREATE TABLE `publishers` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `gamebananaID` mediumint(5) UNSIGNED DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `userID` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `qualities`
--

CREATE TABLE `qualities` (
  `id` tinyint(5) UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `description` varchar(100) NOT NULL,
  `order` tinyint(5) UNSIGNED NOT NULL COMMENT 'larger number = better map. 1 is the worst.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL,
  `submittedBy` smallint(5) UNSIGNED NOT NULL,
  `timeSubmitted` int(11) NOT NULL,
  `qualityID` tinyint(3) UNSIGNED DEFAULT NULL,
  `difficultyID` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'overall perceived difficulty'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` mediumint(5) UNSIGNED NOT NULL,
  `modID` smallint(5) UNSIGNED NOT NULL,
  `reviewCollectionID` smallint(5) UNSIGNED NOT NULL,
  `timeSubmitted` int(11) NOT NULL,
  `likes` varchar(1000) DEFAULT NULL,
  `dislikes` varchar(1000) DEFAULT NULL,
  `otherComments` varchar(1500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `reviews_maps`
--

CREATE TABLE `reviews_maps` (
  `id` int(11) UNSIGNED NOT NULL,
  `reviewID` mediumint(5) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL,
  `lengthID` tinyint(5) UNSIGNED NOT NULL,
  `likes` varchar(500) DEFAULT NULL,
  `dislikes` varchar(500) DEFAULT NULL,
  `otherComments` varchar(500) DEFAULT NULL,
  `displayRatingBool` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `review_collections`
--

CREATE TABLE `review_collections` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `userID` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` varchar(750) NOT NULL,
  `sid` varchar(750) NOT NULL,
  `data` text NOT NULL,
  `expiresAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `techs`
--

CREATE TABLE `techs` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  `defaultDifficultyID` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `tech_videos`
--

CREATE TABLE `tech_videos` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `techID` smallint(5) UNSIGNED NOT NULL,
  `url` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `displayName` varchar(50) NOT NULL,
  `discordID` varchar(50) DEFAULT NULL,
  `discordUsername` varchar(32) NOT NULL,
  `discordDiscrim` varchar(4) NOT NULL,
  `displayDiscord` tinyint(1) NOT NULL,
  `showCompletedMaps` tinyint(1) NOT NULL,
  `timeCreated` int(11) NOT NULL,
  `permissions` set('Super_Admin','Admin','Map_Moderator','Map_Reviewer','Golden_Verifier') NOT NULL,
  `accountStatus` enum('Active','Deleted','Banned','Unlinked') NOT NULL DEFAULT 'Active',
  `timeDeletedOrBanned` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `displayName`, `discordID`, `discordUsername`, `discordDiscrim`, `displayDiscord`, `showCompletedMaps`, `timeCreated`, `permissions`, `accountStatus`, `timeDeletedOrBanned`) VALUES
(1, 'CelesteModsList', 'CelesteModsList', 'CelesteModsList', '9999', 0, 0, 1666549594, 'Admin', 'Active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users_to_maps`
--

CREATE TABLE `users_to_maps` (
  `userID` smallint(5) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `archive_maps`
--
ALTER TABLE `archive_maps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `modChapterSide` (`modID`,`chapter`,`side`),
  ADD KEY `lengthID` (`lengthID`) USING BTREE,
  ADD KEY `mapperUserID` (`mapperUserID`),
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `approvedBy` (`approvedBy`),
  ADD KEY `canonicalDifficultyID` (`canonicalDifficultyID`) USING BTREE,
  ADD KEY `modID` (`modID`),
  ADD KEY `mapID` (`mapID`);

--
-- Indexes for table `archive_mods`
--
ALTER TABLE `archive_mods`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `contentWarning` (`contentWarning`) USING BTREE,
  ADD KEY `publisherID` (`publisherID`),
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `approvedBy` (`approvedBy`),
  ADD KEY `modID` (`modID`);

--
-- Indexes for table `difficulties`
--
ALTER TABLE `difficulties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniqueName` (`parentDifficultyID`,`name`),
  ADD UNIQUE KEY `uniqueOrder` (`parentDifficultyID`,`order`),
  ADD KEY `difficulties_ibfk_2` (`parentDifficultyID`);

--
-- Indexes for table `lengths`
--
ALTER TABLE `lengths`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order` (`order`);

--
-- Indexes for table `maps`
--
ALTER TABLE `maps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `modChapterSide` (`modID`,`chapter`,`side`),
  ADD KEY `lengthID` (`lengthID`) USING BTREE,
  ADD KEY `mapperUserID` (`mapperUserID`),
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `approvedBy` (`approvedBy`),
  ADD KEY `canonicalDifficultyID` (`canonicalDifficultyID`) USING BTREE,
  ADD KEY `modID` (`modID`);

--
-- Indexes for table `maps_to_tech`
--
ALTER TABLE `maps_to_tech`
  ADD PRIMARY KEY (`mapID`,`techID`) USING BTREE,
  ADD KEY `techID` (`techID`) USING BTREE;

--
-- Indexes for table `mods`
--
ALTER TABLE `mods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gamebananaModID` (`gamebananaModID`),
  ADD KEY `contentWarning` (`contentWarning`) USING BTREE,
  ADD KEY `publisherID` (`publisherID`),
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `approvedBy` (`approvedBy`);

--
-- Indexes for table `publishers`
--
ALTER TABLE `publishers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gamebananaID` (`gamebananaID`) USING BTREE,
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `qualities`
--
ALTER TABLE `qualities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order` (`order`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mapAndUser` (`mapID`,`submittedBy`),
  ADD KEY `mapID` (`mapID`) USING BTREE,
  ADD KEY `submittedBy` (`submittedBy`) USING BTREE,
  ADD KEY `difficultyID` (`difficultyID`) USING BTREE,
  ADD KEY `qualityID` (`qualityID`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `modAndReviewCollection` (`modID`,`reviewCollectionID`),
  ADD KEY `modID` (`modID`),
  ADD KEY `reviewCollectionID` (`reviewCollectionID`);

--
-- Indexes for table `reviews_maps`
--
ALTER TABLE `reviews_maps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `review_map` (`reviewID`,`mapID`),
  ADD KEY `lengthID` (`lengthID`) USING BTREE,
  ADD KEY `mapID` (`mapID`),
  ADD KEY `reviewID` (`reviewID`);

--
-- Indexes for table `review_collections`
--
ALTER TABLE `review_collections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sid` (`sid`);

--
-- Indexes for table `techs`
--
ALTER TABLE `techs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `defaultDifficultyID` (`defaultDifficultyID`) USING BTREE;

--
-- Indexes for table `tech_videos`
--
ALTER TABLE `tech_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `techID` (`techID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `discordTag` (`discordUsername`,`discordDiscrim`),
  ADD UNIQUE KEY `discordID` (`discordID`);

--
-- Indexes for table `users_to_maps`
--
ALTER TABLE `users_to_maps`
  ADD PRIMARY KEY (`userID`,`mapID`),
  ADD KEY `mapID` (`mapID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `archive_maps`
--
ALTER TABLE `archive_maps`
  MODIFY `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `difficulties`
--
ALTER TABLE `difficulties`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lengths`
--
ALTER TABLE `lengths`
  MODIFY `id` tinyint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maps`
--
ALTER TABLE `maps`
  MODIFY `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mods`
--
ALTER TABLE `mods`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `publishers`
--
ALTER TABLE `publishers`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qualities`
--
ALTER TABLE `qualities`
  MODIFY `id` tinyint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews_maps`
--
ALTER TABLE `reviews_maps`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_collections`
--
ALTER TABLE `review_collections`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `techs`
--
ALTER TABLE `techs`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tech_videos`
--
ALTER TABLE `tech_videos`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `archive_maps`
--
ALTER TABLE `archive_maps`
  ADD CONSTRAINT `archive_maps_ibfk_0` FOREIGN KEY (`mapID`) REFERENCES `maps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `archive_maps_ibfk_1` FOREIGN KEY (`modID`) REFERENCES `mods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `archive_maps_ibfk_2` FOREIGN KEY (`mapperUserID`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `archive_maps_ibfk_3` FOREIGN KEY (`canonicalDifficultyID`) REFERENCES `difficulties` (`id`),
  ADD CONSTRAINT `archive_maps_ibfk_4` FOREIGN KEY (`lengthID`) REFERENCES `lengths` (`id`),
  ADD CONSTRAINT `archive_maps_ibfk_5` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `archive_maps_ibfk_6` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `archive_mods`
--
ALTER TABLE `archive_mods`
  ADD CONSTRAINT `archive_mods_ibfk_0` FOREIGN KEY (`modID`) REFERENCES `mods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `archive_mods_ibfk_1` FOREIGN KEY (`publisherID`) REFERENCES `publishers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `archive_mods_ibfk_2` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `archive_mods_ibfk_3` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `difficulties`
--
ALTER TABLE `difficulties`
  ADD CONSTRAINT `difficulties_ibfk_2` FOREIGN KEY (`parentDifficultyID`) REFERENCES `difficulties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `maps`
--
ALTER TABLE `maps`
  ADD CONSTRAINT `maps_ibfk_1` FOREIGN KEY (`modID`) REFERENCES `mods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maps_ibfk_2` FOREIGN KEY (`mapperUserID`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maps_ibfk_3` FOREIGN KEY (`canonicalDifficultyID`) REFERENCES `difficulties` (`id`),
  ADD CONSTRAINT `maps_ibfk_4` FOREIGN KEY (`lengthID`) REFERENCES `lengths` (`id`),
  ADD CONSTRAINT `maps_ibfk_5` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maps_ibfk_6` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maps_to_tech`
--
ALTER TABLE `maps_to_tech`
  ADD CONSTRAINT `maps_to_tech_ibfk_1` FOREIGN KEY (`mapID`) REFERENCES `maps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maps_to_tech_ibfk_2` FOREIGN KEY (`techID`) REFERENCES `techs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mods`
--
ALTER TABLE `mods`
  ADD CONSTRAINT `mods_ibfk_1` FOREIGN KEY (`publisherID`) REFERENCES `publishers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mods_ibfk_2` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `mods_ibfk_3` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `publishers`
--
ALTER TABLE `publishers`
  ADD CONSTRAINT `publishers_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`mapID`) REFERENCES `maps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`difficultyID`) REFERENCES `difficulties` (`id`),
  ADD CONSTRAINT `ratings_ibfk_4` FOREIGN KEY (`qualityID`) REFERENCES `qualities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`modID`) REFERENCES `mods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewCollectionID`) REFERENCES `review_collections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews_maps`
--
ALTER TABLE `reviews_maps`
  ADD CONSTRAINT `reviews_maps_ibfk_2` FOREIGN KEY (`lengthID`) REFERENCES `lengths` (`id`),
  ADD CONSTRAINT `reviews_maps_ibfk_3` FOREIGN KEY (`mapID`) REFERENCES `maps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_maps_ibfk_4` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_collections`
--
ALTER TABLE `review_collections`
  ADD CONSTRAINT `review_collections_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `techs`
--
ALTER TABLE `techs`
  ADD CONSTRAINT `techs_ibfk_1` FOREIGN KEY (`defaultDifficultyID`) REFERENCES `difficulties` (`id`);

--
-- Constraints for table `tech_videos`
--
ALTER TABLE `tech_videos`
  ADD CONSTRAINT `tech_videos_ibfk_1` FOREIGN KEY (`techID`) REFERENCES `techs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users_to_maps`
--
ALTER TABLE `users_to_maps`
  ADD CONSTRAINT `users_to_maps_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_to_maps_ibfk_2` FOREIGN KEY (`mapID`) REFERENCES `maps` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
