/* Magic Mirror
 * Module: MMM-Handball
 *
 * By jupadin
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const Log = require("logger");
const moment = require("moment");

module.exports = NodeHelper.create({
    start: function () {
        this.config = null;
        moment.locale('de'); // for German
    },

    socketNotificationReceived: function (notification, payload) {
        // Log.info(`${this.name}: Received socket notification: ${notification}`);
        if (notification === "SET_CONFIG") {
            this.config = payload;
        }

        // Retrieve data from Server...
        this.getTable();
        this.getGames();
        // Set timer to call *getData* every hour
        // setInterval(() => {
        //     this.getDataHandballNet();
        // }, 30 * 1000);
    },

    getTable: function() {
        Log.info(`${this.name}: Fetching data from handball.net-Server...`);
        const url = `https://www.handball.net/a/sportdata/1/widgets/tournament/${this.config.leagueID}/table`;

        const fetchOptions = {};

        fetch(url, fetchOptions)
        .then(response => {
            if (response.status !== 200) {
                throw `Error fetching data with status code ${response.status}`;
            }
            return response.json();
        })
        .then(data => {
            // Log.info(`${this.name}: Data received from Handball-Server.`);
            
            const table = data.table.rows.map(this.mapTable.bind(this));
            const lastUpdate = moment(data.table.updatedAt).format("dd, DD.MM.YYYY HH:mm");

            const orgLogo = "https://handball.net/" + data.tournament.logo.split(":")[1];
            const orgAcronym = data.tournament.acronym;
            const districtAcronym = data.tournament.acronym;

            this.sendSocketNotification("TABLE", {"table": table, lastUpdate: lastUpdate, orgLogo: orgLogo, orgAcronym: orgAcronym, districtAcronym: districtAcronym});

        })
        .catch(error => {
            Log.error(`${this.name}: Error fetching data: ${error}`);
            this.sendSocketNotification("ERROR", error);
        });
        
    },

    mapTable: function(game) {
        const logoUrl = "https://handball.net/" + game.team.logo.split(":")[1];

        const formattedScore = {
            tabScore: game.rank,
            tabTeamname: game.team.name,
            numPlayedGames: game.games,
            numWonGames: game.wins,
            numEqualGames: game.draws,
            numLostGames: game.losses,
            numGoalsShot: game.goals,
            numGoalsGot: game.goalsAgainst,
            numGoalsDiff: game.goalDifference,
            numPointsPlus: game.points.split(":")[0],
            numPointsMinus: game.points.split(":")[1],
            numPoints: game.points,
            teamLogo: logoUrl
        }

        return formattedScore;
    },

    getGames: function() {
        Log.info(`${this.name}: Fetching games from handball.net-Server...`);
        const url = `https://www.handball.net/a/sportdata/1/widgets/tournament/${this.config.leagueID}/schedule`;

        const fetchOptions = {};

        fetch(url, fetchOptions)
        .then(response => {
            if (response.status !== 200) {
                throw `Error fetching data with status code ${response.status}`;
            }
            return response.json();
        })
        .then(data => {
            // Log.info(`${this.name}: Games received from Handball-Server.`);

            const games = data.schedule.data.map(this.mapGames.bind(this));

            this.sendSocketNotification("GAMES", {"games": games});
        })
        .catch(error => {
            Log.error(`${this.name}: Error fetching games: ${error}`);
            this.sendSocketNotification("ERROR", error);
        });
    },

    getGameStatus: function(status) {
        switch (status) {
            case "pre":
                return "P";
            case "STATUS_HALFTIME":
                return "H";
            case "STATUS_POSTPONED":
                return "PP";
            case "post":
                return "F";
            default:
                return "unknown";
        }
    },

    mapGames: function(game) {
        let startTime = moment(game.startsAt).format("dd, DD.MM HH:mm[h]")
        if (game.extraStates?.includes("WoAway")) {
            game.awayGoals = 2;
            game.homeGoals = 0;
            startTime = moment(game.startsAt).format("dd, DD.MM");
        }
        if (game.extraStates?.includes("WoHome")) {
            game.awayGoals = 0;
            game.homeGoals = 2;
            startTime = moment(game.startsAt).format("dd, DD.MM");
        }

        const formattedGame = {
            id: game.gameNumber,
            // Name team home
            h: game.homeTeam.name,
            // Scores team home
            hs: game.homeGoals,
            // Game status
            q: this.getGameStatus(game.state),
            // Start date of match
            starttime: startTime,
            // Name team guest
            v: game.awayTeam.name,
            // Score team guest
            vs: game.awayGoals,
            // Remaining time
            k: null,
            // Link logo team home
            hl: "https://handball.net/" + game.homeTeam.logo.split(":")[1],
            // Link logo team guest
            vl: "https://handball.net/" + game.awayTeam.logo.split(":")[1],
        };

        return formattedGame;
    }
});