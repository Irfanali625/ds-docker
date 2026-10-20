const path = require('path')
const { loadEnvConfig } = require('@next/env')

// Single source of config: load the repo-root .env (variables already set, e.g. Docker build args, win).
loadEnvConfig(path.resolve(__dirname, '../..'))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
