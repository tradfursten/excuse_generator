console.log("Initiate build")

console.log("Fetch from google spreadsheet")
const fs = require('fs').promises;
const { google } = require('googleapis')
const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const GCLOUD_PROJECT = "excusegenerator"
let privatekey = JSON.parse(process.env.CREDENTIALS)

if ("local" === process.env.ENV) {
      privatekey = require("../../../Downloads/excusegenerator-a5505eccfd66.json")
}

async function doStuff() {
      // configure a JWT auth client
      let jwtClient = new google.auth.JWT(
            privatekey.client_email,
            null,
            privatekey.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']);
      //authenticate request
      await jwtClient.authorize()

      //Google Sheets API
      let spreadsheetId = '1-GDAvUuZBc5LBpHOEegYa8QnSPigihL3Fh_1nnqFxMY';
      let sheetName = 'Blad1!A2:C100'
      sheets.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: spreadsheetId,
            range: sheetName
      }, async function (err, response) {
            if (err) {
                  console.log('The API returned an error: ' + err);
            } else {
                  let res ={intro: [], who: [], reason: []}
                  for (let row of response.data.values) {
                        if(row[0]) {
                              res.intro.push(row[0].trim())
                        }
                        if(row[1]) {
                              res.who.push(row[1].trim())
                        }
                        if(row[2]) {
                              res.reason.push(row[2].trim())
                        }
                  }
                  console.log(res)
                  await fs.writeFile("build/test.json", JSON.stringify(res), "utf-8") 
                  console.log("JSON file has been saved.");
                  const file = (await fs.readFile("index.html")).toString()
                  const newFile = file.replace("#INSERT_HERE#", JSON.stringify(res))
                  await fs.writeFile("build/index.html", newFile, "utf-8")
                  
            //})
            }
      });
}

doStuff()
