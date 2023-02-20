const express = require('express');
const cors = require('cors');
const env = require('dotenv').config();

const app = express();
const port = 8080;


app.use(express.json());
app.use(express.urlencoded({extended: true}));

let corsOptions = {
    origin: process.env.APP_HOST_URL,
    credentials: true
}

app.use(cors(corsOptions));

// db 처리 관리
const dbManager = require('./action/db-manager');
new dbManager();

require('./router/main')(app, dbManager);
// require('./router/index')(app, dbManager);

const server = app.listen(port, () => {
    let host = server.address().address;
    let port = server.address().port;

    server.setTimeout(10 * 60 * 1000); //10분

    console.log('Server ready : ' + host + ":" + port);
});