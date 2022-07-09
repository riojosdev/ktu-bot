# ktu-bot

`start.js` file is used to send the first message. It also logs the telegram client id. Please save that client id, it is used in the main bot app. 
Contact developer to setup the heroku. (config variables, install, running...)

---

# KTU-BOT 
> Scrapes KTU Website For MBA announcements and send the latest announcements to telegram via bot and also creates a wordpress article of the same.
___
>>> **WARNING! : Emoji used for telegram message 🔗 & 📩 are used to extract the links for comparison. Please make changes to the `linkReplaced()` too, if format is altered.**
---
# Using Github Automatic Deploy to Heroku.
1. Create a new Heroku Dyno.
2. Select **NodeJS Buildpack** & search for **NodeJS-Puppeteer Buildpack** from the created Dyno's settings tab.
3. Install postgress database **addon**.
4. Add the following **config vars**
    * `CRON_INTERVAL` -> Use CRON time format
    * `DATABASE_URL` -> This is provided by default when postgres heroku addon is added.
    * `JOB_NAME` -> The value used here is `bot` (without quotes). Anything else will break the app.
    * `KTU_URL` -> Use the official KTU website announcements page URL.
    * `TELEGRAM_GROUP_ID` -> After running the `start.js` file you will get the Telegram group id. Copy that here.
    * `TELEGRAM_TOKEN` -> Token provided for the Telegram bot by Telegram's Botfather.

    In the heroku website dashboard, in the Overview tab there is a section called Dyno Formation. Make sure the `worker node index.js` is set to ON. And `web npm start` is set to OFF.
5. Download the main repo from github & change all the `process.env.NAME` with the appropriate values in quotes.
6. **IMPORTANT: Run `node start.js` locally for the first time.** See the steps for **Installation / Use (LOCALLY)** (see below)
7. Copy the Chat Id from the console output. Add it to the config vars for the `TELEGRAM_GROUP_ID`
7. Now delete the `start.js` file from the github. Press . in the repo and right click on `start.js` and select Delete Permanently. From the source control add all changes using the `+` button and type in a commit message then finally press `CTRL+ENTER`.
8. In your heroku Dyno dashboard in the Deploy tab select `Connect with Github`, give access to your Github account & then search and select the KTU-TEST repo. Then Finally Enable Automatic Deployments.

<br>
<br>

# Installation / Use (LOCALLY)
1. Install Node.js & NPM.
2. Run `npm install` from the directory.
3. Reconfigure with user's environment variables on `start.js`.
    **Environment Variable Reference**
    ```javascript
    // Telegram Bot Token
    const bot = new Telegraf('1234567890:AA3hgDT53kiy768GT6Fcvh7o923dVFU091a');
    ```

    ```javascript
    // Heroku Postgres Database URL 
    const cn = {
        connectionString: 'postgres://hdslkjfsjfuklj:fkahdflkksjdfjdid3ufd392udohdkjh32hrrk3hjrh32kjhrh32rh43hrjhj34h@ec2-000-00-000-00.eu-west-1.compute.amazonaws.com:5432/dajkhaslhdlashd',
        ssl: { rejectUnauthorized: false }
    }
    ```

    ```javascript
    // KTU Website URL for the announcements page 
    await page.goto('https://ktu.edu.in/eu/core/announcements.htm', { waitUntil: 'load', timeout: 0 });
    ```
4. Run `node start.js` in the console while in the directory. It should sent a telegram message and create a wordpress post for the latest MBA annoucement on the group where `/start` command was passed.
   Note: The bot should be in the group/channel to recognize the `/start` command.
5. Copy the **chat id** that was outputted in the console. While running `node start.js`.
<br>
<br>

## Basic Postgres SQL Commands.
---
In windows terminal run
```
chcp 1252
heroku pg:psql -a heroku-app-name
```
You can then type the below commands to Create, delete or alter the table.

##### Create table
`CREATE TABLE announcements (id SERIAL, message VARCHAR(2000) PRIMARY KEY, date DATE);`

##### Delete all data in table
`TRUNCATE TABLE announcements;`
###### Restart the id from 1
`ALTER SEQUENCE announcements_id_seq RESTART;`

##### Destroy the entire table along with it's data
`DROP TABLE announcements;`

<br>
<br>

## Heroku commands

Logs
```
heroku logs -a ktumbacommunity --tail
```
