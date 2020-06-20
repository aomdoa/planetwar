import React from 'react'
import Router from 'next/router'
import { GetServerSideProps } from 'next'
import Layout from '../components/Layout'

//TODO: Add proper type definition
type Props = {
  games: Object[]
}

const Index : React.FC<Props> = props => {
  return (
    <Layout>
      <div>
        <h2>index</h2>
        <p>Auth and stuff we'll get figured out later</p>
        <main>
        {props.games.map(game => (
          <div>Game #{game.id}: <a href="#" onClick={() => Router.push('/game?id=[id]', `/game?id=${game.id}`)}>{game.name}</a></div>
        ))}
        </main>
      </div>
      <style jsx>{`
      `}</style>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://localhost:3000/api/games', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFvbWRvYUBnbWFpbC5jb20iLCJpZCI6MSwibmFtZSI6ImFvbWRvYSIsImlzQWRtaW4iOnRydWUsImlhdCI6MTU5MTgzMTY4NX0.-uXAxUKYUXJj681WlnfDmuOQmak902tXugOAGaoDsCs'
    }
  })
  const response = await res.json()
  //TODO: Add check for success
  return {
    props: { 'games': response.data }
  }
}

export default Index