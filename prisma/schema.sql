CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "isAdmin" BOOLEAN
);

CREATE TABLE "game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "startTurns" INTEGER NOT NULL,
    "startLand" INTEGER NOT NULL,
    "safeTurns" INTEGER NOT NULL,
    "turnTime" INTEGER NOT NULL,
    "turnsDone" INTEGER NOT NULL,
    "gameDone" INTEGER NOT NULL
);

CREATE TABLE "player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "availableTurns" INTEGER NOT NULL,
    "currentTurnId" INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"(id),
    FOREIGN KEY ("gameId") REFERENCES "game"(id)
);

CREATE TABLE "turn" (
    "id"                INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId"          INTEGER NOT NULL,
    "gameId"            INTEGER NOT NULL,
    "createdAt"         TIMESTAMP NOT NULL,
    "completedAt"       TIMESTAMP,
    "money"             FLOAT NOT NULL,
    "food"              INTEGER NOT NULL,
    "population"        INTEGER NOT NULL,
    "taxRate"           FLOAT NOT NULL,
    "landAvail"         INTEGER NOT NULL,
    "landCoastal"       INTEGER NOT NULL,
    "landCity"          INTEGER NOT NULL,
    "landAgriculture"   INTEGER NOT NULL,
    "landIndustrial"    INTEGER NOT NULL,
    "armyTroopers"      INTEGER NOT NULL,
    "armyTurrets"       INTEGER NOT NULL,
    "armyBombers"       INTEGER NOT NULL,
    "armyTanks"         INTEGER NOT NULL,
    "armyCarriers"      INTEGER NOT NULL,
    "genTroopers"       INTEGER NOT NULL,
    "genTurrents"       INTEGER NOT NULL,
    "genBombers"        INTEGER NOT NULL,
    "genTanks"          INTEGER NOT NULL,
    "genCarriers"       INTEGER NOT NULL,
    FOREIGN KEY ("playerId") REFERENCES "player"(id),
    FOREIGN KEY ("gameId") REFERENCES "game"(id)
);