
// For Portchain internal use only. The API to the reference implementations
export const PORTCHAIN_MERGER_REFERENCE_IMPLEMENTATION_API_URL = process.env.PORTCHAIN_MERGER_REFERENCE_IMPLEMENTATION_API_URL

// The coding challenge import API
export const PORTCHAIN_VESSEL_SCHEDULES_API_URL = 'https://import-coding-challenge-api.portchain.com/api'

// The HTTP port the server will listen to
export const PORT = process.env.PORT || 3000

// The URL of the database that sequelize will use to connect
export const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/portchaindb"

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'