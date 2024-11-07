import express, { response } from "express";
import axios from "axios";
import ejs from "ejs"; 
import bodyParser from "body-parser"; 
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));


const app = express();
const port = 3000;


 app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));



  

  

app.get("/", async (req, res) => {  
   
    
    try {
        const geo_data = await axios.get("http://ip-api.com/json/");
        const geo = geo_data.data; 
        const lat = geo.lat;
        const lon = geo.lon;
        
        
        const weather = await axios.get(`https://api.weather.gov/points/${lat},${lon}`);
        const result = weather.data;
        
        const city = result.properties.relativeLocation.properties.city; 
        const state = result.properties.relativeLocation.properties.state; 
        

        const gID = result.properties.gridId;
        const gX = result.properties.gridX;
        const gY = result.properties.gridY;
        

        const forecast = await axios.get(`https://api.weather.gov/gridpoints/${gID}/${gX},${gY}/forecast`);
        const myForecast = forecast.data.properties.periods;   
        
        
        let images = myForecast.map(period => { 
          let imageUrl; 
          const probability = period.probabilityOfPrecipitation.value; 
          const isDaytime = period.isDaytime;
          if(probability >= 10 && probability <= 40) {
            imageUrl = '/images/light-rain.png';      
          } else if(probability > 40 && probability <= 70) { 
            imageUrl = '/images/rain.png'; 
          } else if(probability > 70 && probability <= 100) { 
            imageUrl = '/images/thunderstorm.png'; 
          } else if(probability <= 10 && !isDaytime) {
            imageUrl = '/images/evening-clear.png';
          } else { 
            imageUrl = '/images/sunny.png'; 
          } 
          return imageUrl; 
        });




        res.render("index.ejs", { data: myForecast, city: city, state: state, images: images });          
        }        
        catch (error) {
        res.render("index.ejs", { data: "Error" });
    }      
      
});


app.listen(port, () => {
    console.log(`Server is running on port ${ port }`);
})