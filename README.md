# Planet War
Online game that pits players in group world against each other and computer to grow their empires.

## Core Concepts
- user creates account for single email address
	- email address + empire name + emperor name
- player can join match anytime they wish
	- players get X turns of protection (no attack other players during this time) based on configuration
- administrator can create/start/manage games
	- create new game with: max players, starting land, starting money, safe turns
- turns are based on the user doing the turn - e.g. nothing (except attacks) happens to a user without them doing stuff

## Game Play
- turn results
	- random tax refund
	- increase in population based on civ territory + happiness
	- earn money
		- taxes (tax rate + population)
		- ore mines (amount of mine land &ast; random number)
		- tourism (amount of tourism land &ast; random number &ast; happiness)
	- food generated/grown
	- food expired/gone bad
	- feed people based on available food
		- starve people if necessary (affects initial population)
	- army increased based on industrial spaces + happiness + money
- do tax payments payments
	- armed forces
	- region support
	- pay global taxes
- do food payments
	- feed army
	- feed people
- setup production
	- troopers - attack/defense
	- jets - attack/defense
	- turrets - defense
	- bombers - attack
	- tanks - attack
	- carriers - defense
- get new land by using attack troops (if needed)
	- start with a lot of available land that is then filled
- purchase buildings
	- coastal - tourism/income
	- city - population/income
	- agriculture - food
	- industrial - production/income
- generic computer attack/invade
	- immediate result of the invade based on the type selected
	- types are variety of strengths/names/results
	- result is money, food, land w buildings
- user attack/invade
	- immediate result based on user defense
	- essentially the same as computer except based on their strength
- turn over
	- turns will be made available every X minutes and the user has up to the game configured max available

## Core Turn
- get updated money, food grown, food lost, population, army prod
- pay taxes, pay food for army, pay food for people
- invade land
- build out land
- attack players and other territories
- optional change tax rate and build rates

## Technologies
- full stack example that can likely be used: 
- server
	- https://www.prisma.io/
	- https://github.com/prisma/prisma-examples/tree/master/typescript/rest-express
	- alternative maybe https://github.com/prisma/prisma-examples/tree/master/typescript/rest-nextjs
- client
	- https://reactjs.org/

## Future Stuff
 - power generation and support
	- each territory requires a power type
	- power can be generated from nuclear, hydro, gas
	- types have a combination of purchase, ongoing cost, generation etc.
- technology types to improve troops, land and overall results
- variety of income land types - e.g. river, desert, mountain, forest, etc
- different attack types that include weapons of mass destruction
	- when included need new land/building types to protect against the weapons
- spying on land targets to get the details results
