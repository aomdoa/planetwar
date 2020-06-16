CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "isAdmin" BOOLEAN
);

CREATE TABLE "game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" VARCHAR(255) NOT NULL,
    "state" BOOLEAN,
    "startTurns" INTEGER NOT NULL,
    "startLand" INTEGER NOT NULL,
    "startMoney" INTEGER NOT NULL,
    "startFood" INTEGER NOT NULL,
    "safeTurns" INTEGER NOT NULL,
    "turnTime" INTEGER NOT NULL,
    "turnsDone" INTEGER NOT NULL,
    "gameDone" INTEGER NOT NULL
);

CREATE TABLE "player" (
    "id"             INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"           VARCHAR(255) NOT NULL,
    "userId"         INTEGER NOT NULL,
    "gameId"         INTEGER NOT NULL,
    "currentTurnId"  INTEGER,
    "availableTurns" INTEGER NOT NULL,
    "money"          FLOAT,
    "food"           INTEGER,
    "population"     INTEGER,
    "taxRate"        FLOAT,
    "genTroopers"    INTEGER,
    "genTurrets"     INTEGER,
    "genBombers"     INTEGER,
    "genTanks"       INTEGER,
    "genCarriers"    INTEGER,
    "lndAvailable"   INTEGER,
    "lndCoastal"     INTEGER,
    "lndCity"        INTEGER,
    "lndAgriculture" INTEGER,
    "lndIndustrial"  INTEGER,
    "troopers"       INTEGER,
    "turrets"        INTEGER,
    "bombers"        INTEGER,
    "tanks"          INTEGER,
    "carriers"       INTEGER,
    FOREIGN KEY ("userId") REFERENCES "user"(id),
    FOREIGN KEY ("gameId") REFERENCES "game"(id)
);

CREATE TABLE "turn" (
    "id"              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId"        INTEGER NOT NULL,
    "createdAt"       TIMESTAMP NOT NULL,
    "completedAt"     TIMESTAMP,
    "currentPhase"    INTEGER NOT NULL,
    "popGrowth"       INTEGER,   
    "popTax"          FLOAT, 
    "incomeCoastal"   FLOAT, 
    "incomeCity"      FLOAT,
    "incomeIndustrial" FLOAT,
    "foodGrown"       INTEGER,   
    "foodLost"        INTEGER,   
    "newTroopers"     INTEGER,   
    "newTurrets"      INTEGER,   
    "newBombers"      INTEGER,   
    "newTanks"        INTEGER,   
    "newCarriers"     INTEGER,   
    "taxRequired"     FLOAT, 
    "foodArmyReq"     INTEGER,   
    "foodPeopleReq"   INTEGER,   
    "taxPaid"         FLOAT, 
    "foodArmyPaid"    INTEGER,   
    "foodPeoplePaid"  INTEGER,   
    "increaseLand"    INTEGER,   
    "costIncrease"    FLOAT, 
    "bldCoastal"      INTEGER,
    "bldCity"         INTEGER,
    "bldAgriculture"  INTEGER,
    "bldIndustrial"   INTEGER,
    "costBuild"       FLOAT, 
    FOREIGN KEY ("playerId") REFERENCES "player"(id)
);

CREATE TABLE "attack" (
    "id"                INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "turnId"            INTEGER NOT NULL,
    "playerType"        INTEGER NOT NULL,
    "tgtPlayerId"       INTEGER NOT NULL,
    "lostTroopers"      INTEGER,
    "lostBombers"       INTEGER,
    "lostTanks"         INTEGER,
    "killedTroopers"    INTEGER,
    "killedTurrets"     INTEGER,
    "killedBombers"     INTEGER,
    "killedTanks"       INTEGER,
    "killedCarriers"    INTEGER,
    "gainedAvailLand"   INTEGER,
    "gainedCostal"      INTEGER,
    "gainedCity"        INTEGER,
    "gainedAgriculture" INTEGER,
    "gainedIndustrial"  INTEGER,
    FOREIGN KEY ("turnId") REFERENCES "turn"(id)
);