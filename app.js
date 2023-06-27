const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3009, () =>
      console.log(`Server Running at http://localhost:3009/`)
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getCricketQuery = `
 SELECT
 *
 FROM
 cricket_team;`;
  const cricketArray = await db.all(getCricketQuery);
  response.send(
    cricketArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role)
  VALUES
  ('${playerName}', '${jerseyNumber}', '${role}');`;
  const player = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player1 = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player1));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
    UPDATE cricket_team SET player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role= '${role}'
    WHERE
    player_id = '${playerId}';`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = '${playerId}';`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
