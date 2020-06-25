import React from 'react'
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

const Game : React.FC<Props> = props => {
  console.log('RENDER')
  const gameData = getGamesData(props.gameId)
  const playerData = getPlayerData(props.gameId)
  if(!gameData || !playerData) {
    return <div>loading</div>
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
          <div>{gameData.name}</div>
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

export const startTurn = async (gameId) => {
  //TODO: Update for proper execution
  console.log(`startTurn: ${gameId}`)
  let headers = HEADERS
  headers.method = 'POST'
  headers.body = '{"phase": 0}'
  const result = await fetch(`http://localhost:3000/api/game?id=${gameId}`, headers)
  const data = await result.json()
  headers.method = 'GET'
  if (data.success) {
    mutate(`http://localhost:3000/api/game?id=${gameId}`, data.result, false)
    console.log('did stuff')
  } else {
    console.log('fail!')
    window.alert('Unfortunately an error')
  }
}

export const reloadTurn = async (gameId) => {
  console.log('reloadTurn - working as expected')
  let headers = HEADERS
  headers.method = 'POST'
  headers.body = '{"phase": 99}'
  const result = await fetch(`http://localhost:3000/api/game?id=${gameId}`, headers)
  const data = await result.json()
  headers.method = 'GET' //TODO: HACK - figure out the proper header usage

  if (data.success) {
    console.log('SUCCESS')
    mutate(`http://localhost:3000/api/game?id=${gameId}`, data)
  } else {
    window.alert(data.result)
  }

}

const submitInitial = async (gameId, currentTurn) => {
  console.log('submitInitial')
  let headers = HEADERS
  headers.method = 'POST'
  headers.body = JSON.stringify({
    phase: 1,
    taxPaid: (currentTurn.taxPaid === 0) ? currentTurn.taxRequired : currentTurn.taxPaid,
    foodArmyPaid: (currentTurn.foodArmyPaid === 0) ? currentTurn.foodArmyReq : currentTurn.foodArmyPaid,
    foodPeoplePaid: (currentTurn.foodPeoplePaid === 0) ? currentTurn.foodPeopleReq : currentTurn.foodPeoplePaid
  })
  const result = await fetch(`http://localhost:3000/api/game?id=${gameId}`, headers)
  const data = await result.json()
  headers.method = 'GET' //TODO: HACK - figure out the proper header usage

  if (data.success) {
    console.log('SUCCESS')
    mutate(`http://localhost:3000/api/game?id=${gameId}`, data)
  } else {
    window.alert(data.result)
  }
}


export const turnDisplay = (gameData, turnData) => {
  if (turnData.currentTurnId === null) {
    return <button onClick={() => startTurn(gameData.id)}>Take Turn {turnData.availableTurns}</button>
  }
  const currentTurn = turnData.currentTurn
  if(currentTurn.currentPhase === 1) { //INITIAL
console.log(`PEOPLE FOOD ${currentTurn.foodPeoplePaid}`)
    return (
      <div>
          <div>Tax Required: <input onChange={e => currentTurn.taxPaid = e.target.value} type="text" defaultValue={currentTurn.taxRequired} /></div>
          <div>People Food Required: <input onChange={e => currentTurn.foodPeoplePaid = e.target.value} type="text" defaultValue={currentTurn.foodPeopleReq} /></div>
          <div>Army Food Required: <input onChange={e => currentTurn.foodArmyPaid = e.target.value } type="text" defaultValue={currentTurn.foodArmyReq} /></div>
          <div><input type="button" value="Submit" onClick={() => submitInitial(gameData.id, currentTurn)} /></div>
      </div>
    )
  } else {
    return <button onClick={() => reloadTurn(gameData.id)}>IN TURN HACK</button>
  }
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

  return (
    <div>
      <ul>
       {currentTurn.popGrowth > 0 && (<li>Population growth of {currentTurn.popGrowth} people</li>)}
       {currentTurn.popTax > 0 && (<li>Tax income of ${currentTurn.popTax}</li>)}
       {currentTurn.incomeCoastal > 0 && (<li>Coastal income of ${currentTurn.incomeCoastal}</li>)}
       {currentTurn.incomeIndustrial > 0 && (<li>Industrial income of ${currentTurn.incomeIndustrial}</li>)}
       <li>Grew {currentTurn.foodGrown} pieces and lost {currentTurn.foodLost} pieces of food</li>
       <li>Built {builtItems.join(', ')}</li>
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