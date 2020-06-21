import React from 'react'
import Router from 'next/router'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'
import { PlayerClient } from '@prisma/client'
import useSWR from 'swr'

//TODO: Add proper type definition
type Props = {
  player: Object
}

const Game : React.FC<Props> = props => {
  const initialData = props.player
  const getData = url => fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFvbWRvYUBnbWFpbC5jb20iLCJpZCI6MSwibmFtZSI6ImFvbWRvYSIsImlzQWRtaW4iOnRydWUsImlhdCI6MTU5MTgzMTY4NX0.-uXAxUKYUXJj681WlnfDmuOQmak902tXugOAGaoDsCs'
    }
  }).then(_ => _.json()).then(_ => _.data)
  const { data, error } = useSWR('http://localhost:3000/api/game?id=1', getData, { initialData })

  return (
    <Layout>
      <div>
        <h2>game</h2>
        <p>Country Name: {data.name}</p>
        <p>Available Turns: {data.availableTurns}</p>
        <p>Population: {data.population}</p>
        <p>Money: {data.money}</p>
        <table>
          <tbody>
          <tr>
            <td>Available Land</td>
            <td>{data.lndAvailable}</td>
          </tr>
          <tr>
            <td>Agriculture</td>
            <td>{data.lndAgriculture}</td>
            <td>City</td>
            <td>{data.lndCity}</td>
          </tr>
          <tr>
            <td>Coastal</td>
            <td>{data.lndCoastal}</td>
            <td>Industrial</td>
            <td>{data.lndIndustrial}</td>
          </tr>
          <tr>
            <td>Available Army</td>
          </tr>
          <tr>
            <td>Infantry</td>
            <td>{data.troopers}</td>
            <td>Turrets</td>
            <td>{data.turrets}</td>
          </tr>
          <tr>
            <td>Bombers</td>
            <td>{data.bombers}</td>
            <td>Tanks</td>
            <td>{data.tanks}</td>
          </tr>
          <tr>
            <td>Carriers</td>
            <td>{data.carriers}</td>
          </tr>
          </tbody>
        </table>
        <div>
          <button>Take Turn</button>

          Interaction zone that contains the steps for each turn with the submission.
        </div>
        <div>
          Recent actions zone line by line
        </div>
      </div>
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
