import React from 'react'
import Router from 'next/router'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'
import { PlayerClient } from '@prisma/client'

//TODO: Add proper type definition
type Props = {
  player: Object
}

const Game : React.FC<Props> = props => {
  console.dir(props)
  return (
    <Layout>
      <div>
        <h2>game</h2>
        <main>
          <p>Country Name: {props.player.name}</p>
          <p>Available Turns: {props.player.availableTurns}</p>
          <p>Population: {props.player.population}</p>
          <p>Money: {props.player.money}</p>
          <table>
            <tr>
              <td>Available Land</td>
              <td>{props.player.lndAvailable}</td>
            </tr>
            <tr>
              <td>Agriculture</td>
              <td>{props.player.lndAgriculture}</td>
              <td>City</td>
              <td>{props.player.lndCity}</td>
            </tr>
            <tr>
              <td>Coastal</td>
              <td>{props.player.lndCoastal}</td>
              <td>Industrial</td>
              <td>{props.player.lndIndustrial}</td>
            </tr>
            <tr>
              <td>Available Army</td>
            </tr>
            <tr>
              <td>Infantry</td>
              <td>{props.player.troopers}</td>
              <td>Turrets</td>
              <td>{props.player.turrets}</td>
            </tr>
            <tr>
              <td>Bombers</td>
              <td>{props.player.bombers}</td>
              <td>Tanks</td>
              <td>{props.player.tanks}</td>
            </tr>
            <tr>
              <td>Carriers</td>
              <td>{props.player.carriers}</td>
            </tr>
          </table>
        </main>
      </div>
      <style jsx>{`
      `}</style>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`http://localhost:3000/api/game?id=${context.query.id}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFvbWRvYUBnbWFpbC5jb20iLCJpZCI6MSwibmFtZSI6ImFvbWRvYSIsImlzQWRtaW4iOnRydWUsImlhdCI6MTU5MTgzMTY4NX0.-uXAxUKYUXJj681WlnfDmuOQmak902tXugOAGaoDsCs'
    }
  })
  const response = await res.json()
  //TODO: Add check for success
  return {
    props: { 'player': response.data }
  }
}

export default Game 
