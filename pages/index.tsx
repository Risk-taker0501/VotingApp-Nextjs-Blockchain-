import type { NextPage } from 'next'
import VotingPage from './votingpage'

export let APP_VERSION = "v1.0.0"

const Home: NextPage = () => {
  return (
    <VotingPage />
  )
}

export default Home
