-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3002
-- Generation Time: Jun 27, 2022 at 09:04 AM
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
-- Table structure for table `difficulties`
--

CREATE TABLE `difficulties` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `parentModID` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'Null if a default difficulty',
  `parentDifficultyID` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'NULL if not a sub-difficulty',
  `order` tinyint(5) UNSIGNED NOT NULL COMMENT '1-indexed. Order within parent mod''s list of difficulties if a full difficulty, or within difficulty if a sub-difficulty. 1 is the easiest.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `difficulties`
--

INSERT INTO `difficulties` (`id`, `name`, `description`, `parentModID`, `parentDifficultyID`, `order`) VALUES
(1, 'defaultParentDifficulty1', 'lolololol', NULL, NULL, 1),
(2, 'defaultDifficulty1', 'fjsadkfhasdkljf sjdlk fjsadl;', NULL, 1, 1),
(9, 'defaultParentDifficulty2', 'js djflks jflk sdjlk lsafj lksdaj fl', NULL, NULL, 2),
(10, 'contestModTestDifficulty1', NULL, 36, NULL, 1),
(11, 'testDiff2SubDiff1', NULL, NULL, 45, 1),
(12, 'testDiff2SubDiff2', NULL, NULL, 45, 2),
(13, 'contestModTestDifficulty2', NULL, 36, NULL, 2),
(14, 'contestModTestDifficulty3', NULL, 36, NULL, 3),
(45, 'defaultParentDifficulty3', NULL, NULL, NULL, 3);

-- --------------------------------------------------------

--
-- Table structure for table `goldens`
--

CREATE TABLE `goldens` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL,
  `fullClearBool` tinyint(1) NOT NULL,
  `goldenList` enum('Hard','Standard','Full_Game_Runs_And_Challenges','Other','Archived','Rejected') NOT NULL,
  `otherList` varchar(30) DEFAULT NULL COMMENT 'NULL if goldenList != "other"',
  `topGoldenListRank` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'null if not on the list'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `goldens_to_golden_submissions`
--

CREATE TABLE `goldens_to_golden_submissions` (
  `goldenID` smallint(5) UNSIGNED NOT NULL,
  `goldenSubmissionID` mediumint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `golden_players`
--

CREATE TABLE `golden_players` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `userID` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `golden_players`
--

INSERT INTO `golden_players` (`id`, `name`, `userID`) VALUES
(2, 'spaghetti man', 2),
(6, 'steve mcqueen', 14);

-- --------------------------------------------------------

--
-- Table structure for table `golden_runs`
--

CREATE TABLE `golden_runs` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `goldenID` smallint(5) UNSIGNED NOT NULL,
  `goldenPlayerID` smallint(5) UNSIGNED NOT NULL,
  `proofURL` varchar(500) DEFAULT NULL,
  `timeCompleted` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `golden_runs_to_golden_submissions`
--

CREATE TABLE `golden_runs_to_golden_submissions` (
  `goldenRunID` smallint(5) UNSIGNED NOT NULL,
  `goldenSubmissionID` mediumint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `golden_submissions`
--

CREATE TABLE `golden_submissions` (
  `id` mediumint(5) UNSIGNED NOT NULL,
  `timeSubmitted` int(11) NOT NULL,
  `submittedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeApproved` int(11) DEFAULT NULL,
  `approvedBy` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `maps_details`
--

CREATE TABLE `maps_details` (
  `id` mediumint(5) UNSIGNED NOT NULL,
  `mapId` mediumint(5) UNSIGNED NOT NULL,
  `revision` tinyint(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'starts at 0 when the map is created',
  `mapperUserID` smallint(5) UNSIGNED DEFAULT NULL,
  `mapperNameString` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `canonicalDifficultyID` smallint(5) UNSIGNED NOT NULL COMMENT 'difficulty assigned when submitting the map, uses celestemods.com''s slightly modified version of the Spring Collab 2020 difficulty system.',
  `lengthID` tinyint(5) UNSIGNED NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `chapter` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'normal maps only',
  `side` enum('A','B','C','D','E') DEFAULT NULL COMMENT 'normal maps only',
  `modDifficultyID` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'contest/collab maps only. difficulty using the mod''s difficulty list.',
  `overallRank` tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'contest maps only (overall rank in the contest)',
  `mapRemovedFromModBool` tinyint(1) NOT NULL DEFAULT 0,
  `timeSubmitted` int(11) NOT NULL,
  `submittedBy` smallint(5) UNSIGNED DEFAULT NULL,
  `timeApproved` int(11) DEFAULT NULL,
  `approvedBy` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `maps_details`
--

INSERT INTO `maps_details` (`id`, `mapId`, `revision`, `mapperUserID`, `mapperNameString`, `name`, `canonicalDifficultyID`, `lengthID`, `description`, `notes`, `chapter`, `side`, `modDifficultyID`, `overallRank`, `mapRemovedFromModBool`, `timeSubmitted`, `submittedBy`, `timeApproved`, `approvedBy`) VALUES
(1, 1, 0, NULL, 'otobot1', 'testMap1', 2, 2, 'hfdskj hfksh dkjsf hkjsdh flas', 'dfs fhdkjsh fkshkdfj kjsh k ', 1, 'A', NULL, NULL, 0, 1645996164, 1, 1645996164, 1),
(2, 1, 1, 1, 'otobot1', 'dfasdfsaf wae ', 9, 3, NULL, NULL, 1, 'A', NULL, NULL, 0, 1646370784, 2, 1646370785, 1),
(3, 2, 0, 1, 'otobot1', 'fklsadjfkwea f', 9, 5, NULL, NULL, NULL, 'A', 9, NULL, 0, 1646619775, 1, 1646619775, 1),
(43, 34, 0, 14, 'user14huehuehue', 'contestModTest', 1, 2, NULL, NULL, NULL, NULL, 11, 5, 0, 1649625756, 5, 1649625757, 1);

-- --------------------------------------------------------

--
-- Table structure for table `maps_ids`
--

CREATE TABLE `maps_ids` (
  `id` mediumint(5) UNSIGNED NOT NULL,
  `modID` smallint(5) UNSIGNED NOT NULL,
  `minimumModRevision` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `maps_ids`
--

INSERT INTO `maps_ids` (`id`, `modID`, `minimumModRevision`) VALUES
(1, 1, 0),
(2, 2, 0),
(34, 36, 0);

-- --------------------------------------------------------

--
-- Table structure for table `maps_to_tech`
--

CREATE TABLE `maps_to_tech` (
  `mapDetailsID` mediumint(5) UNSIGNED NOT NULL,
  `techID` smallint(5) UNSIGNED NOT NULL,
  `fullClearOnlyBool` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `maps_to_tech`
--

INSERT INTO `maps_to_tech` (`mapDetailsID`, `techID`, `fullClearOnlyBool`) VALUES
(1, 2, 0),
(1, 3, 0),
(43, 3, 0);

-- --------------------------------------------------------

--
-- Table structure for table `map_lengths`
--

CREATE TABLE `map_lengths` (
  `id` tinyint(5) UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `description` varchar(100) NOT NULL,
  `order` tinyint(5) UNSIGNED NOT NULL COMMENT 'larger number = longer map. 1 is the shortest.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `map_lengths`
--

INSERT INTO `map_lengths` (`id`, `name`, `description`, `order`) VALUES
(1, 'Very Short', 'C-Side length map, often with under 5 short rooms.', 1),
(2, 'Short', 'Quick maps to get through with not too many screens.', 2),
(3, 'Medium', 'Reasonable length, completable in one sitting with some familiarity of the difficulty.', 3),
(4, 'Long', 'Requires some persistence and most likely more than one sitting to complete.', 4),
(5, 'Very Long', 'Much longer than average maps, sometimes as a result of being a large lobby or campaign.', 5);

-- --------------------------------------------------------

--
-- Table structure for table `mods_details`
--

CREATE TABLE `mods_details` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `revision` tinyint(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'starts at 0 when the mod is created',
  `type` enum('Normal','Collab','Contest','Lobby') NOT NULL DEFAULT 'Normal',
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
  `approvedBy` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `mods_details`
--

INSERT INTO `mods_details` (`id`, `revision`, `type`, `name`, `publisherID`, `contentWarning`, `notes`, `shortDescription`, `longDescription`, `gamebananaModID`, `timeSubmitted`, `submittedBy`, `timeApproved`, `approvedBy`) VALUES
(1, 0, 'Normal', 'testMod1', 8, 0, 'sfd fsd fas fawef a ', ' fas fasd fwea faw fsd faw e', 'fjkhsdk hfkljsdh fskah klfs d ', 666666, 0, 1, 1645998863, 1),
(1, 1, 'Normal', 'kgdjdk jgld fl s14124', 10, 0, NULL, 'fsdfasdf wae atdsfa', ' fsdf awef bh bfjsadh fihaweu fhaiusdhf kjdsahf iaweh ufhiaeh fiuadijf', 69, 1645996164, 1, 1645996164, 1),
(2, 0, 'Collab', 'fhsh aihfuishadk hhwyae', 13, 1, 'dfssdf awe fasdf', 'a dfwaef sadfsaefawe f sdf', 'sdf ae fsadfsdfnjksahf  whaeiofhi sahdflukhwaefh iuahf sdjkf hjklhfiuwaehf iusdkjfh iheui hfaiua fhiu', 6996, 1645996164, 2, 1645996165, 1),
(36, 0, 'Contest', 'modPost contestModTest', 16, 0, 'jfskdafjka kjfkjsd hfkjhaw iuofhisadf hsidf hsadk flk', 'fhakjfhdkjl hfuiwa hfiuhd fjksdafh klweahui hfui kjfdsh fuawehiu fiu hfia hfjksda sdasfsdagfwa', NULL, 123456, 1649625756, 5, 1649625771, 5),
(36, 2, 'Normal', 'modPost contestModTest', 16, 0, NULL, 'fhakjfhdkjl hfuiwa hfiuhd fjksdafh klweahui hfui kjfdsh fuawehiu fiu hfia hfjksda sdasfsdagfwa', NULL, 123456, 1649627390, 5, NULL, NULL),
(36, 3, 'Normal', 'modPost contestModTest', 16, 0, 'null hehe', 'fhakjfhdkjl hfuiwa hfiuhd fjksdafh klweahui hfui kjfdsh fuawehiu fiu hfia hfjksda sdasfsdagfwa', NULL, 123456, 1649627430, 5, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `mods_ids`
--

CREATE TABLE `mods_ids` (
  `id` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `mods_ids`
--

INSERT INTO `mods_ids` (`id`) VALUES
(1),
(2),
(36);

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

--
-- Dumping data for table `publishers`
--

INSERT INTO `publishers` (`id`, `gamebananaID`, `name`, `userID`) VALUES
(8, 69, 'testName', 2),
(9, 96, 'testName', 2),
(10, 420, 'groovy Dude', 2),
(11, 1721022, 'Thegur90', NULL),
(12, 88, 'x', 14),
(13, 2, 'w', 14),
(14, 99, 'y', 14),
(16, 1784854, 'otobot1', 1),
(17, NULL, 'user14huehuehue', 14),
(18, 1735177, 'pansear', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(10) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL,
  `submittedBy` smallint(5) UNSIGNED NOT NULL,
  `timeSubmitted` int(11) NOT NULL,
  `quality` tinyint(3) UNSIGNED DEFAULT NULL,
  `difficultyID` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'overall perceived difficulty'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `mapID`, `submittedBy`, `timeSubmitted`, `quality`, `difficultyID`) VALUES
(1, 1, 1, 1637616115, 2, 2),
(2, 1, 5, 1645996515, 4, NULL),
(3, 34, 1, 1646518420, NULL, 2),
(7, 1, 2, 1638503655, NULL, 12);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` mediumint(5) UNSIGNED NOT NULL,
  `timeSubmitted` int(11) NOT NULL,
  `submittedBy` smallint(5) UNSIGNED NOT NULL,
  `modID` smallint(5) UNSIGNED NOT NULL,
  `likes` varchar(1000) DEFAULT NULL,
  `dislikes` varchar(1000) DEFAULT NULL,
  `otherComments` varchar(1500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `reviews_maps`
--

CREATE TABLE `reviews_maps` (
  `id` int(10) UNSIGNED NOT NULL,
  `reviewID` mediumint(5) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL,
  `lengthID` tinyint(5) UNSIGNED NOT NULL,
  `likes` varchar(500) NOT NULL,
  `dislikes` varchar(500) NOT NULL,
  `otherComments` varchar(500) NOT NULL,
  `displayRatingBool` tinyint(1) NOT NULL DEFAULT 0
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

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`id`, `sid`, `data`, `expiresAt`) VALUES
('cl4we6oh200006ofj2k419eqy', 'BigA7dkJSAfSx8WDauTmisuB32iIH3VH', '{\"cookie\":{\"originalMaxAge\":1800000,\"expires\":\"2022-06-27T07:32:39.014Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/api\",\"sameSite\":\"strict\"},\"refreshCount\":0,\"userID\":20,\"permissions\":[\"\"]}', '2022-06-27 07:32:39');

-- --------------------------------------------------------

--
-- Table structure for table `tech_list`
--

CREATE TABLE `tech_list` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  `defaultDifficultyID` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tech_list`
--

INSERT INTO `tech_list` (`id`, `name`, `description`, `defaultDifficultyID`) VALUES
(2, 'tech1', 'fjdklsjf klsaj fjsd jf sajdflk ajds', 1),
(3, 'tech2', NULL, 1);

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
  `discordID` varchar(50) NOT NULL,
  `discordUsername` varchar(32) NOT NULL,
  `discordDiscrim` varchar(4) NOT NULL,
  `displayDiscord` tinyint(1) NOT NULL,
  `showCompletedMaps` tinyint(1) NOT NULL,
  `timeCreated` int(11) NOT NULL,
  `permissions` set('Super_Admin','Admin','Map_Moderator','Map_Reviewer','Golden_Verifier') NOT NULL,
  `accountStatus` enum('Active','Deleted','Banned') NOT NULL DEFAULT 'Active',
  `timeDeletedOrBanned` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `displayName`, `discordID`, `discordUsername`, `discordDiscrim`, `displayDiscord`, `showCompletedMaps`, `timeCreated`, `permissions`, `accountStatus`, `timeDeletedOrBanned`) VALUES
(1, 'otobot1', '215360124053618688', 'otobot1', '1564', 1, 1, 1636963200, 'Super_Admin', 'Active', NULL),
(2, 'testName', '9', 'steve', '4675', 1, 0, 1637441076, '', 'Active', NULL),
(5, 'steve', '5', 'steve', '5555', 0, 0, 1, '', 'Active', NULL),
(14, 'user14huehuehue', '99', 'steve jobs', '6996', 1, 0, 1637594908, 'Map_Moderator,Golden_Verifier', 'Active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users_to_maps`
--

CREATE TABLE `users_to_maps` (
  `userID` smallint(5) UNSIGNED NOT NULL,
  `mapID` mediumint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users_to_maps`
--

INSERT INTO `users_to_maps` (`userID`, `mapID`) VALUES
(1, 1),
(1, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `difficulties`
--
ALTER TABLE `difficulties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `difficultiesByMod` (`parentModID`,`parentDifficultyID`,`order`) USING BTREE,
  ADD KEY `difficulties_ibfk_2` (`parentDifficultyID`);

--
-- Indexes for table `goldens`
--
ALTER TABLE `goldens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mapPlusFullClear` (`mapID`,`fullClearBool`) USING BTREE;

--
-- Indexes for table `goldens_to_golden_submissions`
--
ALTER TABLE `goldens_to_golden_submissions`
  ADD PRIMARY KEY (`goldenID`,`goldenSubmissionID`),
  ADD KEY `goldenSubmissionID` (`goldenSubmissionID`);

--
-- Indexes for table `golden_players`
--
ALTER TABLE `golden_players`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userID` (`userID`);

--
-- Indexes for table `golden_runs`
--
ALTER TABLE `golden_runs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `goldenID` (`goldenID`),
  ADD KEY `goldenPlayerID` (`goldenPlayerID`);

--
-- Indexes for table `golden_runs_to_golden_submissions`
--
ALTER TABLE `golden_runs_to_golden_submissions`
  ADD PRIMARY KEY (`goldenRunID`,`goldenSubmissionID`),
  ADD KEY `goldenSubmissionID` (`goldenSubmissionID`);

--
-- Indexes for table `golden_submissions`
--
ALTER TABLE `golden_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `approvedBy` (`approvedBy`);

--
-- Indexes for table `maps_details`
--
ALTER TABLE `maps_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mapIdRevision` (`mapId`,`revision`) USING BTREE,
  ADD KEY `lengthID` (`lengthID`) USING BTREE,
  ADD KEY `difficultyID` (`modDifficultyID`) USING BTREE,
  ADD KEY `mapperUserID` (`mapperUserID`),
  ADD KEY `assignedDifficultyID` (`canonicalDifficultyID`) USING BTREE,
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `approvedBy` (`approvedBy`),
  ADD KEY `revision` (`revision`);

--
-- Indexes for table `maps_ids`
--
ALTER TABLE `maps_ids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modID` (`modID`) USING BTREE;

--
-- Indexes for table `maps_to_tech`
--
ALTER TABLE `maps_to_tech`
  ADD PRIMARY KEY (`mapDetailsID`,`techID`) USING BTREE,
  ADD KEY `techID` (`techID`) USING BTREE;

--
-- Indexes for table `map_lengths`
--
ALTER TABLE `map_lengths`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order` (`order`);

--
-- Indexes for table `mods_details`
--
ALTER TABLE `mods_details`
  ADD PRIMARY KEY (`id`,`revision`) USING BTREE,
  ADD KEY `contentWarning` (`contentWarning`) USING BTREE,
  ADD KEY `publisherID` (`publisherID`),
  ADD KEY `gamebananaModID` (`gamebananaModID`) USING BTREE,
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `approvedBy` (`approvedBy`);

--
-- Indexes for table `mods_ids`
--
ALTER TABLE `mods_ids`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `publishers`
--
ALTER TABLE `publishers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `gamebananaID` (`gamebananaID`) USING BTREE,
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mapAndUser` (`mapID`,`submittedBy`),
  ADD KEY `mapID` (`mapID`) USING BTREE,
  ADD KEY `submittedBy` (`submittedBy`) USING BTREE,
  ADD KEY `difficultyID` (`difficultyID`) USING BTREE;

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submittedBy` (`submittedBy`),
  ADD KEY `modID` (`modID`);

--
-- Indexes for table `reviews_maps`
--
ALTER TABLE `reviews_maps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `review_map` (`reviewID`,`mapID`),
  ADD KEY `reviewID` (`reviewID`) USING BTREE,
  ADD KEY `lengthID` (`lengthID`) USING BTREE,
  ADD KEY `mapID` (`mapID`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sid` (`sid`);

--
-- Indexes for table `tech_list`
--
ALTER TABLE `tech_list`
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
-- AUTO_INCREMENT for table `difficulties`
--
ALTER TABLE `difficulties`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `goldens`
--
ALTER TABLE `goldens`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `golden_players`
--
ALTER TABLE `golden_players`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `golden_submissions`
--
ALTER TABLE `golden_submissions`
  MODIFY `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maps_details`
--
ALTER TABLE `maps_details`
  MODIFY `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `maps_ids`
--
ALTER TABLE `maps_ids`
  MODIFY `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `map_lengths`
--
ALTER TABLE `map_lengths`
  MODIFY `id` tinyint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `mods_ids`
--
ALTER TABLE `mods_ids`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `publishers`
--
ALTER TABLE `publishers`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews_maps`
--
ALTER TABLE `reviews_maps`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tech_list`
--
ALTER TABLE `tech_list`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tech_videos`
--
ALTER TABLE `tech_videos`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `difficulties`
--
ALTER TABLE `difficulties`
  ADD CONSTRAINT `difficulties_ibfk_1` FOREIGN KEY (`parentModID`) REFERENCES `mods_ids` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `difficulties_ibfk_2` FOREIGN KEY (`parentDifficultyID`) REFERENCES `difficulties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `goldens`
--
ALTER TABLE `goldens`
  ADD CONSTRAINT `goldens_ibfk_1` FOREIGN KEY (`mapID`) REFERENCES `maps_ids` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `goldens_to_golden_submissions`
--
ALTER TABLE `goldens_to_golden_submissions`
  ADD CONSTRAINT `goldens_to_golden_submissions_ibfk_1` FOREIGN KEY (`goldenID`) REFERENCES `goldens` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `goldens_to_golden_submissions_ibfk_2` FOREIGN KEY (`goldenSubmissionID`) REFERENCES `golden_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `golden_players`
--
ALTER TABLE `golden_players`
  ADD CONSTRAINT `golden_players_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `golden_runs`
--
ALTER TABLE `golden_runs`
  ADD CONSTRAINT `golden_runs_ibfk_1` FOREIGN KEY (`goldenID`) REFERENCES `goldens` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `golden_runs_ibfk_2` FOREIGN KEY (`goldenPlayerID`) REFERENCES `golden_players` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `golden_runs_to_golden_submissions`
--
ALTER TABLE `golden_runs_to_golden_submissions`
  ADD CONSTRAINT `golden_runs_to_golden_submissions_ibfk_1` FOREIGN KEY (`goldenRunID`) REFERENCES `golden_runs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `golden_runs_to_golden_submissions_ibfk_2` FOREIGN KEY (`goldenSubmissionID`) REFERENCES `golden_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `golden_submissions`
--
ALTER TABLE `golden_submissions`
  ADD CONSTRAINT `golden_submissions_ibfk_1` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `golden_submissions_ibfk_2` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maps_details`
--
ALTER TABLE `maps_details`
  ADD CONSTRAINT `maps_details_ibfk_1` FOREIGN KEY (`mapId`) REFERENCES `maps_ids` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maps_details_ibfk_2` FOREIGN KEY (`mapperUserID`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maps_details_ibfk_3` FOREIGN KEY (`canonicalDifficultyID`) REFERENCES `difficulties` (`id`),
  ADD CONSTRAINT `maps_details_ibfk_4` FOREIGN KEY (`lengthID`) REFERENCES `map_lengths` (`id`),
  ADD CONSTRAINT `maps_details_ibfk_5` FOREIGN KEY (`modDifficultyID`) REFERENCES `difficulties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maps_details_ibfk_6` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `maps_details_ibfk_7` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `maps_ids`
--
ALTER TABLE `maps_ids`
  ADD CONSTRAINT `maps_ids_ibfk_1` FOREIGN KEY (`modID`) REFERENCES `mods_ids` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `maps_to_tech`
--
ALTER TABLE `maps_to_tech`
  ADD CONSTRAINT `maps_to_tech_ibfk_1` FOREIGN KEY (`mapDetailsID`) REFERENCES `maps_details` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maps_to_tech_ibfk_2` FOREIGN KEY (`techID`) REFERENCES `tech_list` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mods_details`
--
ALTER TABLE `mods_details`
  ADD CONSTRAINT `mods_details_ibfk_1` FOREIGN KEY (`id`) REFERENCES `mods_ids` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mods_details_ibfk_2` FOREIGN KEY (`publisherID`) REFERENCES `publishers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mods_details_ibfk_3` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `mods_details_ibfk_4` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`mapID`) REFERENCES `maps_ids` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`difficultyID`) REFERENCES `difficulties` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`modID`) REFERENCES `mods_ids` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews_maps`
--
ALTER TABLE `reviews_maps`
  ADD CONSTRAINT `reviews_maps_ibfk_1` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_maps_ibfk_2` FOREIGN KEY (`lengthID`) REFERENCES `map_lengths` (`id`),
  ADD CONSTRAINT `reviews_maps_ibfk_3` FOREIGN KEY (`mapID`) REFERENCES `maps_ids` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tech_list`
--
ALTER TABLE `tech_list`
  ADD CONSTRAINT `tech_list_ibfk_1` FOREIGN KEY (`defaultDifficultyID`) REFERENCES `difficulties` (`id`);

--
-- Constraints for table `tech_videos`
--
ALTER TABLE `tech_videos`
  ADD CONSTRAINT `tech_videos_ibfk_1` FOREIGN KEY (`techID`) REFERENCES `tech_list` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users_to_maps`
--
ALTER TABLE `users_to_maps`
  ADD CONSTRAINT `users_to_maps_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_to_maps_ibfk_2` FOREIGN KEY (`mapID`) REFERENCES `maps_ids` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
