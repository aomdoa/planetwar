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
  const { data, error } = useSWR('/api/game?id=1', getData, { initialData })

  return (
    <Layout>
      <div>
        <h2>game</h2>
        <p>Country Name: {data.name}</p>
        <table>
          <tbody>
            <tr>
              <td>Population</td>
              <td>{data.population}</td>
              <td>Money</td>
              <td>{data.money}</td>
            </tr>
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
        <div className="recentAction">
          Recent actions and results with scrollbar of what's been doing. Latest at top and messages simply added
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
          Fake message to test<br />
        </div>
        <div className="currentTurn">
          <button>Take Turn {data.availableTurns}</button><br />
          Take turn will do the initial call to get the results which are displayed and the form will be available for the user to enter and submit. Future will have
          the scrolling stuff but that's future.<br />
          Form stays in same spot with results above actually.
        </div>
      </div>
      <style jsx>{`
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
