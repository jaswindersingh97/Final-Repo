const express = require("express");
const authRoutes = require('./Endpoints/AuthRoutes')
const cors =require('cors');
const SecureRoutes = require('./Endpoints/SecureRoutes');
const AuthMiddleware = require('./Middleware/AuthMiddleware');
const app=express();
const connectDB = require('./config/db'); 
const socketSetup = require('./Socket/Socket');

const port = process.env.PORT || 3000;
require('dotenv').config();
connectDB();
app.use(express.json())
// app.use(cors());
app.use(cors({
    origin: process.env.CLIENT_URL   // Allow only requests from this URL
}));


app.get("/",(req,res)=>{
    res.send("helloworld")
})
app.use('/auth', authRoutes);

app.use('/secureRoute',AuthMiddleware,SecureRoutes)

const server = app.listen(port,()=>{
    console.log("server is running on port",port)
    console.log(`Process ID: ${process.pid}`); // Get the process ID

})

socketSetup(server);
