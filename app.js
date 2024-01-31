const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'covid19India.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//API-1

app.get('/states/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      state;`
  const booksArray = await db.all(getBooksQuery)
  const convertDb = dbObject => {
    return {
      stateId: dbObject.state_id,
      stateName: dbObject.state_name,
      population: dbObject.population,
    }
  }
  response.send(booksArray.map(eachPlayer => convertDb(eachPlayer)))
})
//API-2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getQuery = `
    SELECT
      *
    FROM
      state
    WHERE
      state_id = ${stateId};`
  const books = await db.get(getQuery)
  const convert = db => {
    return {
      stateId: db.state_id,
      stateName: db.state_name,
      population: db.population,
    }
  }
  response.send(convert(books))
})

//API-3

app.use(express.json())
app.post('/districts/', async (request, response) => {
  const reDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = reDetails
  const createSql = `
  INSERT INTO district(
    district_name, state_id, cases,cured,active,deaths
  )
  VALUES(
  '${districtName}',
  '${stateId}',
  '${cases}',
  '${cured}',
  '${active}',
  '${deaths}');`

  const dbResponse = await db.run(createSql)
  const bookId = dbResponse.lastID
  response.send('District Successfully Added')
})

//API-4

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getQuery = `
    SELECT
      *
    FROM
      district
    WHERE
      district_id = ${districtId};`
  const books = await db.get(getQuery)
  const converts = db => {
    return {
      districtId: db.district_id,
      districtName: db.district_name,
      stateId: db.state_id,
      cases: db.cases,
      cured: db.cured,
      active: db.active,
      deaths: db.deaths,
    }
  }
  response.send(converts(books))
})
//API-5
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteBookQuer = `
    DELETE FROM
      district
    WHERE
      district_id = ${districtId};`
  await db.run(deleteBookQuer)
  response.send('District Removed')
})

//API-6
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const teamDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = teamDetails
  const updateTeam = `
  UPDATE 
    district
  SET
  district_name='${districtName}',
  state_id = '${stateId}',
  cases = '${cases}',
  cured='${cured}',
  active='${active}',
  deaths='${deaths}'
  WHERE
     district_id = ${districtId};`

  await db.run(updateTeam)
  response.send('District Details Updated')
})

//API-7

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
      district
    WHERE
      state_id = ${stateId};`
  const boo = await db.get(getQuery)
  response.send({
    totalCases: boo['SUM(cases)'],
    totalCured: boo['SUM(cured)'],
    totalActive: boo['SUM(active)'],
    totalDeaths: boo['SUM(deaths'],
  })
})

//API-8

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
select state_id from district
where district_id = ${districtId};
` //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery)

  const getStateNameQuery = `
select state_name as stateName from state
where state_id = ${getDistrictIdQueryResponse.state_id};
` //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery)
  console.log(getStateNameQueryResponse)
  response.send(getStateNameQueryResponse)
}) //sending the required response

module.exports = app
