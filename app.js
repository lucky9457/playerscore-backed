const express = require("express");
const app = express();
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server Started");
    });
  } catch (e) {
    console.log(e.message);
  }
};
initialize();
//API1

app.get("/players/", async (request, response) => {
  const getplayersQuery = `
    SELECT 
    player_id as playerId,
    player_name as playerName
    FROM
    player_details
    
    `;
  const playerlist = await db.all(getplayersQuery);
  response.send(playerlist);
});

//API2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
    player_id as playerId,
    player_name as playerName
    FROM
    player_details
    WHERE
    player_id = ${playerId};
    
    `;
  const getplayer = await db.get(getPlayerQuery);
  response.send(getplayer);
});

//API3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateplayerQuery = `
    UPDATE
    player_details
    SET
    player_name = '${playerName}'
    WHERE
    player_id = ${playerId};
    
    `;
  await db.run(updateplayerQuery);
  response.send("Player Details Updated");
});

//API4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getmatchQuery = `
    SELECT 
    match_id as matchId,
    match,
    year
    FROM
    match_details
    WHERE
    match_id = ${matchId};    `;
  const getmatch = await db.get(getmatchQuery);
  response.send(getmatch);
});

//API5

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQeury = `
    SELECT match_details.match_id as matchId,
    match,year
    FROM
    match_details JOIN player_match_score ON match_details.match_id = player_match_score.match_id
    WHERE
    player_id = ${playerId};
    
    `;
  const getmatchlst = await db.all(getMatchQeury);
  response.send(getmatchlst);
});

//API6
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const query = `
    SELECT
    player_details.player_id as playerId,
    player_details.player_name as playerName
    FROM
    player_details JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE
    player_match_score.match_id = ${matchId};
    `;
  const getlst = await db.all(query);
  response.send(getlst);
});

//API7
app.get("/players/:playerId/playerscores", async (request, response) => {
  const { playerId } = request.params;
  const main_query = `
  SELECT 
  player_details.player_id as playerId,
  player_details.player_name as playerName,
  sum(player_match_score.fours) as totalFours,sum(player_match_score.score) as totalScore,
  sum(player_match_score.sixes) as totalSixes
  FROM
  player_details JOIN player_match_score ON player_details.player_id = player_match_score.player_id
  GROUP BY
  player_details.player_id
  HAVING 
  player_details.player_id = ${playerId};
  `;
  const getdetais = await db.get(main_query);
  response.send(getdetais);
});
module.exports = app;
