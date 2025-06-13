import {  server } from './app.js'
import dotenv from 'dotenv';
dotenv.config(
    {
        path: './.env'
    }
);
server.listen(process.env.PORT || 8000, () => {
    console.log(`server is running at port :${process.env.PORT} after mysql connected`)
})