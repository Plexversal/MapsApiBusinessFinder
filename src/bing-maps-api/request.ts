import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
dotenv.config({ path: '../.env' })
const API_KEY: any = process.env.BING_TOKEN;


export default function fetchNearbyPlaces(
    ofs: number = 1, 
    limit: number = 100, 
    LATITUDE: string, 
    LONGITUDE: string, 
    QUERY: string, 
    csvFile: boolean = false, 
    jsonFile: boolean = false): void {

    const url: string = `https://atlas.microsoft.com/search/poi/category/json?api-version=1.0&lat=${LATITUDE}&lon=${LONGITUDE}&subscription-key=${API_KEY}&radius=1000&query=${QUERY}`;
    const pageUrl: string = url + `&ofs=${ofs}&limit=${limit}`
    fetch(pageUrl)
        .then(r => r.json())
        .then((data: any) => {
            console.log(`${data.summary.totalResults} results found`)
            if (ofs + limit < data.summary.totalResults && ofs + limit <= 1900) {
                const nextOfs: number = ofs + limit;
                fetchNearbyPlaces(nextOfs, limit, QUERY, LATITUDE, LONGITUDE, csvFile, jsonFile)
            }

            let new_json = [];
            for (let result of data.results) { 
              new_json.push({ 
                "Name": result.poi.name,
                "Website": result.poi.url || 'null',
                "Number": result.poi.phone || 'null',
                "Address": result.address.freeformAddress
              })
            }

            if (jsonFile) {
                fs.writeFile(`../data-dump/${QUERY}-bing-full.json`, JSON.stringify(data), (err) => {
                    if (err) throw err
                    console.log('JSON File Formatted has been saved.')
                })
   
                fs.writeFile(`../data-dump/${QUERY}-bing-formatted.json`, JSON.stringify(new_json, null, 4), (err) => { 
                  if (err) throw err
                  console.log('JSON File Formatted has been saved.')
                })

            }

            if (csvFile) {

                const header = Object.keys(new_json[0]);
                const headerString = header.join(",") + "\n"
                const replacer = (_:any, value: string) => value ?? ""
                const rows = new_json.map((obj: any) => {
                    return header.map((key) => JSON.stringify(obj[key], replacer)).join(",")
                })
                const csv = headerString + rows.join("\n");
                fs.writeFile(`../data-dump/${QUERY}-bing-formatted.csv`, csv, (err) => { 
                    if (err) throw err;
                    console.log('CSV File Formatted has been saved.')
                });
                
            }
        })
}