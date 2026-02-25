const express = require("express")
const app = express()
const PORT = 3000

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const venueRoutes = require("./routes/venueRoutes")
app.use("/", venueRoutes)


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})