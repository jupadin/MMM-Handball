/* Magic Mirror
 * Module: MMM-Handball
 *
 * By jupadin
 * MIT Licensed.
 */

Module.register("MMM-Handball", {
    // Default module config.
    defaults: {
        header: "MMM-Handball",
        updateInterval: 60 * 60 * 1000, // Update every hour
        animationSpeed: 2 * 1000, // Animation speed in milliseconds
        showHeaderAsIcons: true,
        showGames: true,
        showFooter: true,
        loading: true,
        colored: false,
    },

    // Define start sequence.
    start: function () {
        Log.info("Starting module: " + this.name);
        this.loading = true;
        this.error = false;
        this.payload = {
            table: [],
            games: []
        };
        this.updateTimer = null;

        if (!this.config.leagueID) {
            this.error = true;
            Log.error(`${this.name}: No leagueID configured! Please check your config.`);
            return;
        }

        // Set notification to backend to start fetching data.
        this.sendSocketNotification("SET_CONFIG", this.config);   
    },

    // Define required styles.
    getStyles: function () {
        return ["MMM-Handball.css"];
    },

    // Define required translations.
    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
    },

    getHeader: function() {
        if (this.loading || this.error) {
            return this.config.header;
        } else {
            return `${this.config.header} - ${this.payload?.orgAcronym}: ${this.payload?.districtAcronym}`;
        }
    },

    getTemplate: function() {
        // console.log(`${this.name}: Getting template...`);
        return "MMM-Handball.njk";
    },

    getTemplateData: function() {
        console.log(`${this.name}: Preparing template data...`);
        // console.log(this.config);

        console.log(this.loading, this.error, this.payload);

        if (this.loading) {
            return {
                loading: true,
                message: this.translate("LOADING"),
            }
        }

        if (this.error) {
            return {
                error: true,
                message: this.translate("ERROR"),
            }
        }

        console.log(this.payload?.table || []);
        console.log(this.payload?.games || []);

        return {
            loading: false,
            error: false,
            uncolored: !this.config.colored,
            table: this.payload?.table || [],
            showGames: this.config.showGames || false,
            games: this.payload?.games || [],//.slice(0, 10) || [],
            focus_on: this.config.focus_on || [],
            lastUpdate: this.payload?.lastUpdate,
            showFooter: this.config.showFooter,
            showHeaderAsIcons: this.config.showHeaderAsIcons,
        }
    },

    // Override socket notification handler.
    socketNotificationReceived: function(notification, payload) {
        // Log.info(`${this.name}: Received notification: ${notification}`);
        this.payload = this.payload || {};
        this.loading = false;
        switch(notification){
            case "TABLE":
                this.payload.table = payload.table;
                this.payload.lastUpdate = payload.lastUpdate;
                this.payload.orgLogo = payload.orgLogo;
                this.payload.orgAcronym = payload.orgAcronym;
                this.payload.districtAcronym = payload.districtAcronym;
                this.error = false
                // Log.info(`${this.name}: Data received from backend.`);
                break;
            case "GAMES":
                this.payload.games = payload.games;
                // this.loading = false;
                this.error = false;
                // Log.info(`${this.name}: Games data received from backend.`);
                break;
            default:
                // this.loading = false;
                this.payload = payload || {};
                this.error = true;
                // Log.error(`${this.name}: Error receiving data: ${payload}`);
                break;
        }
        this.updateDom(this.config.animationSpeed);
    },
});