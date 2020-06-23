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
  console.dir(data)
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
    console.log('will do stuff')
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

export const turnDisplay = (gameData, turnData) => {
  if (turnData.currentTurnId === null) {
    return <button onClick={() => startTurn(gameData.id)}>Take Turn {turnData.availableTurns}</button>
  } else {
    return <button onClick={() => reloadTurn(gameData.id)}>IN TURN HACK</button>
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  //TODO: Just use context in the render?
  return {
    props: { 'gameId': context.query.id }
  }
}

export default Game 