// const cors = require('cors');
const env = require('dotenv').config();

// let corsOptions = {
//     origin: process.env.APP_HOST_URL,
//     credentials: true
// }
// app.use(cors(corsOptions));

// db 처리 관리
const dbManager = require('./action/db-manager');
new dbManager();

require('./router/main')(dbManager);
// require('./router/index')(app, dbManager);
