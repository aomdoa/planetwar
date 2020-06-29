import React, { useState } from 'react'
import Router from 'next/router'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'
import { PlayerClient } from '@prisma/client'
import useSWR, { mutate } from 'swr'
import { HEADERS } from './config'

//TODO: Add proper type definition
type Props = {
  gameId: Number,
  game: Object,
  player: Object
}

const getData = url => fetch(url, HEADERS).then(_ => _.json()).then(_ => _.result)

const getGamesData = (gameId) => {
  const { data, error } = useSWR(`http://localhost:3000/api/games?id=${gameId}`, getData)
  return data
}

const getPlayerData = (gameId) => {
  const { data, error } = useSWR(`http://localhost:3000/api/game?id=${gameId}`, getData)
  return data
}

const getGameConfiguration = (gameId) => {
  const { data, error } = useSWR(`http://localhost:3000/api/game?id=${gameId}&action=costs`, getData)
  return data
}


const Game : React.FC<Props> = props => {
  const gameData = getGamesData(props.gameId)
  const playerData = getPlayerData(props.gameId)
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
    genTroopers: 0,
    genTurrets: 0,
    genBombers: 0,
    genCarriers: 0,
    genTanks: 0
  })

  if(!gameData || !playerData || !gameConfig) {
    return <div>loading</div>
  }

  const updateField = e => {
    setSubmitData({
      ...submitData,
      [e.target.name]: e.target.value
    })
  }

  const processTurn = async (gameId, submitData) => {
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
 
  const submitTurn = async (gameId, phase) => {
    await processTurn(gameId, {
      ...submitData,
      phase: phase
    })
  }

  const getBuildSubmitValue = () => {
    const cost = submitData.increaseLand * gameConfig.INCREASE_LAND_COST
               + submitData.bldCoastal * gameConfig.BUILD_COASTAL_COST
               + submitData.bldCity * gameConfig.BUILD_CITY_COST
               + submitData.bldAgriculture * gameConfig.BUILD_AGRICULTURE_COST
               + submitData.bldIndustrial * gameConfig.BUILD_INDUSTRIAL_COST
    return `Purchase land for $${cost}`
  }

  const turnDisplay = (gameData, turnData) => {
    if (turnData.currentTurnId === null) {
      return <button onClick={() => submitTurn(gameData.id, 0)}>Take Turn {turnData.availableTurns}</button>
    }
    const currentTurn = turnData.currentTurn
//TODO: default values are broken broken broken
    if(currentTurn.currentPhase === 1) { //INITIAL
      return (
        <div>
            <div>Tax Required: <input name="taxPaid" onChange={updateField} type="text" defaultValue={currentTurn.taxRequired} /></div>
            <div>People Food Required: <input name="foodPeoplePaid" onChange={updateField} type="text" defaultValue={currentTurn.foodPeopleReq} /></div>
            <div>Army Food Required: <input name="foodArmyPaid" onChange={updateField} type="text" defaultValue={currentTurn.foodArmyReq} /></div>
            <div><input type="button" value="Submit" onClick={() => submitTurn(gameData.id, 1)} /></div>
        </div>
      )
    } else if (currentTurn.currentPhase === 2) { //BUILD
      return (
        <div>
          <div>Increase Land: <input name="increaseLand" onChange={updateField} type="text" defaultValue={submitData.increaseLand} /> at ${submitData.increaseLand * gameConfig.INCREASE_LAND_COST}</div>
          <div>Build Coastal: <input name="bldCoastal" onChange={updateField} type="text" defaultValue={submitData.bldCoastal} /> at ${submitData.bldCoastal * gameConfig.BUILD_COASTAL_COST}</div>
          <div>Build City:  <input name="bldCity" onChange={updateField} type="text" defaultValue={submitData.bldCity} /> at ${submitData.bldCity * gameConfig.BUILD_CITY_COST}</div>
          <div>Build Agriculture:  <input name="bldAgriculture" onChange={updateField} type="text" defaultValue={submitData.bldAgriculture} /> at ${submitData.bldAgriculture * gameConfig.BUILD_AGRICULTURE_COST}</div>
          <div>Build Industrial:  <input name="bldIndustrial" onChange={updateField} type="text" defaultValue={submitData.bldIndustrial} /> at ${submitData.bldIndustrial * gameConfig.BUILD_INDUSTRIAL_COST}</div>
          <div><input type="button" value={getBuildSubmitValue()} onClick={() => submitTurn(gameData.id, 2)} /></div>
        </div>
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
          <div>Tax Rate: <input name="taxRate" onChange={updateField} type="text" defaultValue={turnData.taxRate} /></div>
          <div>Infantry Build Rate: <input name="genTroopers" onChange={updateField} type="text" defaultValue={turnData.genTroopers} /></div>
          <div>Turrets Build Rate: <input name="genTurrets" onChange={updateField} type="text" defaultValue={turnData.genTurrets} /></div>
          <div>Bombers Build Rate: <input name="genBombers" onChange={updateField} type="text" defaultValue={turnData.genBombers} /></div>
          <div>Tanks Build Rate: <input name="genTanks" onChange={updateField} type="text" defaultValue={turnData.genTanks} /></div>
          <div>Carriers Build Rate: <input name="genCarriers" onChange={updateField} type="text" defaultValue={turnData.genCarriers} /></div>
          <div><input type="button" value="Submit" onClick={() => submitTurn(gameData.id, 4)} /></div>
        </div>
      )
  
    } else {
      return <div>{currentTurn.currentPhase}</div>
    }
  }

  return (
    <Layout>
      <div>
        <h2>GAME: {gameData.name}</h2>
        <table>
          <tbody>
            <tr>
              <th>{playerData.name}</th>
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

export const actionDisplay = (gameData, turnData) => {
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
       {currentTurn.popGrowth > 0 && (<li>Population growth of {currentTurn.popGrowth} people</li>)}
       {currentTurn.popTax > 0 && (<li>Tax income of ${currentTurn.popTax}</li>)}
       {currentTurn.incomeCoastal > 0 && (<li>Coastal income of ${currentTurn.incomeCoastal}</li>)}
       {currentTurn.incomeIndustrial > 0 && (<li>Industrial income of ${currentTurn.incomeIndustrial}</li>)}
       <li>Grew {currentTurn.foodGrown} pieces and lost {currentTurn.foodLost} pieces of food</li>
       {builtItems.length > 0 && (<li>Built {builtItems.join(', ')}</li>)}
       {currentTurn.increaseLand > 0 && (<li>Increased land by {currentTurn.increaseLand} for ${currentTurn.costIncrease}</li>)}
       {builtLand.length > 0 && currentTurn.costBuild > 0 && (<li>Built {builtLand.join(', ')} for ${currentTurn.costBuild}</li>)}

      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  //TODO: Just use context in the render?
  return {
    props: { 'gameId': context.query.id }
  }
}

export default Game 