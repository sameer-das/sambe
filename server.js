const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const PORT = 3000;
const app = express();

// Load Routers
const StaffRoute = require('./routes/staff');
const StudentRoutes = require('./routes/students');
const DepartmentRoute = require('./routes/department');
const AcademicRoute = require('./routes/academic');
const BatchRoute = require('./routes/batch');
const RoomRoute = require('./routes/room');
const FileUploadRoute = require('./routes/fileupload');
const LibraryRoute = require('./routes/library');
const UserRoute = require('./routes/user');


// Execution of middleware 

// For Maintenance Mode run the below middleware
// app.use((req, res, next) => {
//     res.status(503).send('The site is under maintenance');
// });

app.use(cors());
app.use(cookieParser());

app.use(function (req, res, next) {
    //set headers to allow cross origin request.

    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// app.get('/', (req, res) => {
//     console.log(req.cookies);
//     res.send('ok');
// })
app.use(express.static(path.join(__dirname, '../samet/dist/samet/')));

app.use(bodyParser.json());
app.use(StaffRoute);
app.use(StudentRoutes);
app.use(DepartmentRoute);
app.use(AcademicRoute);
app.use(BatchRoute);
app.use(RoomRoute);
app.use(FileUploadRoute);
app.use(LibraryRoute);
app.use(UserRoute);




app.get('*', (req,res) => {
    return res.sendFile(path.join(__dirname, '../samet/dist/samet/index.html'))
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});