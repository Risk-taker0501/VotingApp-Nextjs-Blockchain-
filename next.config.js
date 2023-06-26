/** @type {import('next').NextConfig} */
require("dotenv").config();

const nextConfig = {
  experimental: {
    appDir: true,
  },
  compiler: {
    styledComponents: true,
  },
  env:{
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    CHAIN_ID: process.env.CHAIN_ID,
    RPC_URL: process.env.RPC_URL,
	API_URL: process.env.API_URL,
  }
}

module.exports = nextConfig