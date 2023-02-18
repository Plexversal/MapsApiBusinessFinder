import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
dotenv.config({ path: '../.env' })
const API_KEY: any = process.env.GOOGLE_TOKEN;


export default function fetchNearbyPlaces(
    RADIUS: number,
    LATITUDE: string, 
    LONGITUDE: string,
    QUERY: string, 
    csvFile: boolean = false, 
    jsonFile: boolean = false): void {

    const url: string = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${API_KEY}&location=${LATITUDE},${LONGITUDE}&radius=${RADIUS}`;
    fetch(url)
        .then(r => r.json())
        .then(async (data: any) => {
            console.log(`${data.results.length} results found`)
            if(data.status == 'ZERO_RESULTS') return console.log('nothing to show')
            let results: any = []
            for (const business of data.results) {
                const placeUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${API_KEY}&place_id=${business.place_id}`;
                let placeResponse = await fetch(placeUrl);
                let placeData = await placeResponse.json();

                results.push(placeData);
              }

              if (data.next_page_token) {
                let nextPageUrl = `${url}&pagetoken=${data.next_page_token}`;
                let response = await fetch(nextPageUrl);
                let newData = await response.json();
            
                for (const business of newData.results) {

                  const placeUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${API_KEY}&place_id=${business.place_id}`;
                  let placeResponse = await fetch(placeUrl);
                  let placeData = await placeResponse.json();
            
                  results.push(placeData);
                }
              }

            let new_json = [];
            for (let result of results) { 
              new_json.push({ 
                "Name": result.result.name || 'null',
                "Website": result.result.website || 'null',
                "Number": result.result.international_phone_number || 'null',
                "Address": result.result.formatted_address || 'null'
              })
            }

            if (jsonFile) {
                fs.writeFile(`../data-dump/${QUERY}-google-full.json`, JSON.stringify(results), (err) => {
                    if (err) throw err
                    console.log('JSON File Formatted has been saved.')
                })
   
                fs.writeFile(`../data-dump/${QUERY}-google-formatted.json`, JSON.stringify(new_json, null, 4), (err) => { 
                  if (err) throw err
                  console.log('JSON File Formatted has been saved.')
                })

            }

            if (csvFile) {
                if(new_json.length == 0) return;
                const header = Object.keys(new_json[0]);
                const headerString = header.join(",") + "\n"
                const replacer = (_:any, value: string) => value ?? ""
                const rows = new_json.map((obj: any) => {
                    return header.map((key) => JSON.stringify(obj[key], replacer)).join(",")
                })
                const csv = headerString + rows.join("\n");
                fs.writeFile(`../data-dump/${QUERY}-google-formatted.csv`, csv, (err) => { 
                    if (err) throw err;
                    console.log('CSV File Formatted has been saved.')
                });
                
            }
        })
}