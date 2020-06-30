import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'
import useSWR, { mutate } from 'swr'
import { HEADERS } from './config'

//TODO: Add proper type definition
type Props = {
  gameId: number
}

type GameData = {
  id: number,
  name: string
}

type PlayerData = {
  id: number,
  name: string,
  currentTurnId: number,
  currentTurn: CurrentTurn
  taxRate: number,
  genTroopers: number,
  genTurrets: number,
  genBombers: number,
  genTanks: number,
  genCarriers: number,
  population: number,
  money: number,
  food: number,
  lndAvailable: number,
  lndAgriculture: number,
  lndCity: number,
  lndCoastal: number,
  lndIndustrial: number,
  troopers: number,
  turrets: number,
  bombers: number,
  tanks: number,
  carriers: number,
  availableTurns: number
}

type CurrentTurn = {
  taxRequired: number,
  foodArmyReq: number,
  foodPeopleReq: number,
  currentPhase: number,
  newTroopers: number,
  newTurrets: number,
  newBombers: number,
  newTanks: number,
  newCarriers: number,
  bldCoastal: number,
  bldCity: number,
  bldAgriculture: number,
  bldIndustrial: number,
  costBuild: number,
  increaseLand: number,
  costIncrease: number,
  foodArmyPaid: number,
  foodPeoplePaid: number,
  taxPaid: number,
  foodGrown: number,
  foodLost: number,
  incomeIndustrial: number,
  incomeCoastal: number,
  popTax: number,
  popGrowth: number
}

const getData: Object = url => fetch(url, HEADERS).then(_ => _.json()).then(_ => _.result)

const getGamesData = (gameId: number): GameData => {
  const { data, error } = useSWR(`http://localhost:3000/api/games?id=${gameId}`, getData)
  return data
}

const getPlayerData = (gameId: number): PlayerData => {
  const { data, error } = useSWR(`http://localhost:3000/api/game?id=${gameId}`, getData)
  return data
}

const getGameConfiguration = (gameId: number) => {
  const { data, error } = useSWR(`http://localhost:3000/api/game?id=${gameId}&action=costs`, getData)
  return data
}


const Game : React.FC<Props> = props => {
  //Get our data for where we at
  const gameData: GameData = getGamesData(props.gameId)
  const playerData: PlayerData = getPlayerData(props.gameId)
  const gameConfig = getGameConfiguration(props.gameId)

  const [ submitData, setSubmitData ] = useState({
    taxPaid: 0,
    foodArmyPaid: 0,
    foodPeoplePaid: 0,
    increaseLand: 0,
    bldCoastal: 0,
    bldCity: 0,
    bldAgriculture: 0,
    bldIndustrial: 0,
    taxRate: 0,
    genTroopers: -1,
    genTurrets: -1,
    genBombers: -1,
    genCarriers: -1,
    genTanks: -1
  })

  if(!gameData || !playerData || !gameConfig) {
    return <div>loading</div>
  }

  //Ensure we have default values set if there is nothing entered by user
  if (playerData.currentTurn) {
    if (submitData.taxPaid <= 0 && playerData.currentTurn.taxRequired > 0) {
      setSubmitData({...submitData, taxPaid: playerData.currentTurn.taxRequired})
    }
    if (submitData.foodArmyPaid <= 0 && playerData.currentTurn.foodArmyReq > 0) {
      setSubmitData({...submitData, foodArmyPaid: playerData.currentTurn.foodArmyReq})
    }
    if (submitData.foodPeoplePaid <= 0 && playerData.currentTurn.foodPeopleReq > 0) {
      setSubmitData({...submitData, foodPeoplePaid: playerData.currentTurn.foodPeopleReq})
    }
    if (submitData.taxRate <= 0 && playerData.taxRate > 0) {
      setSubmitData({...submitData, taxRate: playerData.taxRate})
    }
    if (submitData.genTroopers < 0 && playerData.genTroopers >= 0) {
      setSubmitData({...submitData, genTroopers: playerData.genTroopers})
    }
    if (submitData.genTurrets < 0 && playerData.genTurrets >= 0) {
      setSubmitData({...submitData, genTurrets: playerData.genTurrets})
    }
    if (submitData.genBombers < 0 && playerData.genBombers >= 0) {
      setSubmitData({...submitData, genBombers: playerData.genBombers})
    }
    if (submitData.genTanks < 0 && playerData.genTanks >= 0) {
      setSubmitData({...submitData, genTanks: playerData.genTanks})
    }
    if (submitData.genCarriers < 0 && playerData.genCarriers >= 0) {
      setSubmitData({...submitData, genCarriers: playerData.genCarriers})
    }
  } else if (submitData.taxPaid > 0 || submitData.foodArmyPaid > 0 || submitData.foodPeoplePaid > 0) {
    //Reset data if going back into the turn
    setSubmitData({
      taxPaid: 0,
      foodArmyPaid: 0,
      foodPeoplePaid: 0,
      increaseLand: 0,
      bldCoastal: 0,
      bldCity: 0,
      bldAgriculture: 0,
      bldIndustrial: 0,
      taxRate: 0,
      genTroopers: -1,
      genTurrets: -1,
      genBombers: -1,
      genCarriers: -1,
      genTanks: -1
    })
  }

  //Functions to process the turn and data
  const updateField = e => {
    setSubmitData({
      ...submitData,
      [e.target.name]: e.target.value
    })
  }

  const processTurn = async (gameId: number, submitData: Object) => {
    console.log('processTurn')
    let headers = HEADERS
    headers.method = 'POST'
    headers.body = JSON.stringify(submitData)
    const result = await fetch(`http://localhost:3000/api/game?id=${gameId}`, headers)
    const data = await result.json()
    headers.method = 'GET' //TODO: HACK - figure out the proper header usage
  
    if (data.success) {
      console.log('SUCCESS')
      mutate(`http://localhost:3000/api/game?id=${gameId}`, data.result)
    } else {
      window.alert(data.result)
    }
  }
 
  const submitTurn = async (gameId: number, phase: number) => {
    await processTurn(gameId, {
      ...submitData,
      phase: phase
    })
    if (phase === 1) {
      //TODO: Fix the reload hack - going from 0 to 1 has the form broken without a reload
      window.location.reload()
    }
  }

  //Simple function to build out the land purchase costs based on user entry
  const getBuildSubmitValue = () => {
    const cost = submitData.increaseLand * gameConfig.INCREASE_LAND_COST
               + submitData.bldCoastal * gameConfig.BUILD_COASTAL_COST
               + submitData.bldCity * gameConfig.BUILD_CITY_COST
               + submitData.bldAgriculture * gameConfig.BUILD_AGRICULTURE_COST
               + submitData.bldIndustrial * gameConfig.BUILD_INDUSTRIAL_COST
    return `Purchase land for $${cost}`
  }

  //Display the details of the current turn and what user has entered
  const turnDisplay = (gameData: GameData, turnData: PlayerData) => {
    if (turnData.currentTurnId === null) {
      return <button onClick={() => submitTurn(gameData.id, 0)}>Take Turn {turnData.availableTurns}</button>
    }
    const currentTurn = turnData.currentTurn
    if(currentTurn.currentPhase === 1) { //INITIAL
      return (
        <form name="phaseOne">
            <div>Tax Required: <input name="taxPaid" onChange={updateField} type="text" defaultValue={submitData.taxPaid} /></div>
            <div>People Food Required: <input name="foodPeoplePaid" onChange={updateField} type="text" defaultValue={submitData.foodPeoplePaid} /></div>
            <div>Army Food Required: <input name="foodArmyPaid" onChange={updateField} type="text" defaultValue={submitData.foodArmyPaid} /></div>
            <div><input type="button" value="Submit" onClick={() => submitTurn(gameData.id, 1)} /></div>
        </form>
      )
    } else if (currentTurn.currentPhase === 2) { //BUILD
      return (
        <form name="phaseTwo">
          <div>Increase Land: <input name="increaseLand" onChange={updateField} type="text" defaultValue={submitData.increaseLand} /> at ${submitData.increaseLand * gameConfig.INCREASE_LAND_COST}</div>
          <div>Build Coastal: <input name="bldCoastal" onChange={updateField} type="text" defaultValue={submitData.bldCoastal} /> at ${submitData.bldCoastal * gameConfig.BUILD_COASTAL_COST}</div>
          <div>Build City:  <input name="bldCity" onChange={updateField} type="text" defaultValue={submitData.bldCity} /> at ${submitData.bldCity * gameConfig.BUILD_CITY_COST}</div>
          <div>Build Agriculture:  <input name="bldAgriculture" onChange={updateField} type="text" defaultValue={submitData.bldAgriculture} /> at ${submitData.bldAgriculture * gameConfig.BUILD_AGRICULTURE_COST}</div>
          <div>Build Industrial:  <input name="bldIndustrial" onChange={updateField} type="text" defaultValue={submitData.bldIndustrial} /> at ${submitData.bldIndustrial * gameConfig.BUILD_INDUSTRIAL_COST}</div>
          <div><input type="button" value={getBuildSubmitValue()} onClick={() => submitTurn(gameData.id, 2)} /></div>
        </form>
      )
    } else if (currentTurn.currentPhase === 3) { //ATTACK
      return (
        <div>
          <div>No attacking yet</div>
          <div><input type="button" value="Submit" onClick={() => submitTurn(gameData.id, 3)} /></div>
        </div>
      )
    } else if (currentTurn.currentPhase === 4) { //COMPLETE
      return (
        <div>
          <div>Tax Rate: <input name="taxRate" onChange={updateField} type="text" defaultValue={submitData.taxRate} /></div>
          <div>Infantry Build Rate: <input name="genTroopers" onChange={updateField} type="text" defaultValue={submitData.genTroopers} /></div>
          <div>Turrets Build Rate: <input name="genTurrets" onChange={updateField} type="text" defaultValue={submitData.genTurrets} /></div>
          <div>Bombers Build Rate: <input name="genBombers" onChange={updateField} type="text" defaultValue={submitData.genBombers} /></div>
          <div>Tanks Build Rate: <input name="genTanks" onChange={updateField} type="text" defaultValue={submitData.genTanks} /></div>
          <div>Carriers Build Rate: <input name="genCarriers" onChange={updateField} type="text" defaultValue={submitData.genCarriers} /></div>
          <div><input type="button" value="Submit" onClick={() => submitTurn(gameData.id, 4)} /></div>
        </div>
      )
  
    } else {
      return <div>{currentTurn.currentPhase}</div>
    }
  }

  //Main page layout
  return (
    <Layout>
      <div>
        <h2>GAME: {gameData.name}</h2>
        <table>
          <tbody>
            <tr>
              <th>Player: {playerData.name}</th>
            </tr>
            <tr>
              <td>Population</td>
              <td>{playerData.population}</td>
              <td>Money</td>
              <td>{playerData.money}</td>
              <td>Food</td>
              <td>{playerData.food}</td>
              <td>Available Land</td>
              <td>{playerData.lndAvailable}</td>
            </tr>
            <tr>
              <th>Land</th>
            </tr>
            <tr>
              <td>Agriculture</td>
              <td>{playerData.lndAgriculture}</td>
              <td>City</td>
              <td>{playerData.lndCity}</td>
              <td>Coastal</td>
              <td>{playerData.lndCoastal}</td>
              <td>Industrial</td>
              <td>{playerData.lndIndustrial}</td>
            </tr>
            <tr>
              <th>Available Army</th>
            </tr>
            <tr>
              <td>Infantry</td>
              <td>{playerData.troopers}</td>
              <td>Turrets</td>
              <td>{playerData.turrets}</td>
              <td>Bombers</td>
              <td>{playerData.bombers}</td>
              <td>Tanks</td>
              <td>{playerData.tanks}</td>
              <td>Carriers</td>
              <td>{playerData.carriers}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <div>You have {playerData.availableTurns} turns available</div>
        </div>
        <div className="recentAction">
          {actionDisplay(gameData, playerData)}
        </div>
        <div className="currentTurn">
          {turnDisplay(gameData, playerData)}
        </div>
      </div>
      <style jsx>{`
        td {
          padding: 10px;
        }

        th {
          padding-bottom: 0px;
          padding-top: 4px;
          text-align: left;
        }

        .recentAction {
          height: 160px;
          border: 1px solid black;
          overflow-y: scroll;
          margin: 1em;
        }

        .currentTurn {
          border: 1px solid black;
          margin: 1em;
          margin-top: 0;
        }
      `}</style>
    </Layout>
  )
}

//Displays the actions taken place this turn (but not passed)
//TODO: Add support for displaying past turns as well
export const actionDisplay = (gameData: GameData, turnData: PlayerData) => {
  if (turnData.currentTurnId === null) {
    return <p>Turn not started yet...</p>
  }
  const currentTurn = turnData.currentTurn
  let builtItems = []
  if (currentTurn.newTroopers > 0) {
    builtItems.push(`${currentTurn.newTroopers} troopers`)
  }
  if (currentTurn.newTurrets > 0) {
    builtItems.push(`${currentTurn.newTurrets} turrets`)
  }
  if (currentTurn.newBombers > 0) {
    builtItems.push(`${currentTurn.newBombers} bombers`)
  }
  if (currentTurn.newTanks > 0) {
    builtItems.push(`${currentTurn.newTanks} tanks`)
  }
  if (currentTurn.newCarriers > 0) {
    builtItems.push(`${currentTurn.newCarriers} carriers`)
  }

  let builtLand = []
  if (currentTurn.bldCoastal > 0) {
    builtLand.push(`${currentTurn.bldCoastal} coastal`)
  }
  if (currentTurn.bldCity > 0) {
    builtLand.push(`${currentTurn.bldCity} city`)
  }
  if (currentTurn.bldAgriculture > 0) {
    builtLand.push(`${currentTurn.bldAgriculture} agriculture`)
  }
  if (currentTurn.bldIndustrial > 0) {
    builtLand.push(`${currentTurn.bldIndustrial} industrial`)
  }

  return (
    <div>
      <ul>
       {builtLand.length > 0 && currentTurn.costBuild > 0 && (<li>Built {builtLand.join(', ')} for ${currentTurn.costBuild}</li>)}
       {currentTurn.increaseLand > 0 && (<li>Increased land by {currentTurn.increaseLand} for ${currentTurn.costIncrease}</li>)}
       {currentTurn.foodArmyPaid > 0 && (<li>Gave {currentTurn.foodArmyPaid} pieces of food to the army requiring {currentTurn.foodArmyReq} pieces</li>)}
       {currentTurn.foodPeoplePaid > 0 && (<li>Gave {currentTurn.foodPeoplePaid} pieces of food to the community requiring {currentTurn.foodPeopleReq} pieces</li>)}
       {currentTurn.taxPaid > 0 && (<li>Paid ${currentTurn.taxPaid} of the ${currentTurn.taxRequired} tax required</li>)}
       {builtItems.length > 0 && (<li>Built {builtItems.join(', ')}</li>)}
       <li>Grew {currentTurn.foodGrown} pieces and lost {currentTurn.foodLost} pieces of food</li>
       {currentTurn.incomeIndustrial > 0 && (<li>Industrial income of ${currentTurn.incomeIndustrial}</li>)}
       {currentTurn.incomeCoastal > 0 && (<li>Coastal income of ${currentTurn.incomeCoastal}</li>)}
       {currentTurn.popTax > 0 && (<li>Tax income of ${currentTurn.popTax}</li>)}
       {currentTurn.popGrowth > 0 && (<li>Population growth of {currentTurn.popGrowth} people</li>)}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { 'gameId': context.query.id }
  }
}

export default Game 