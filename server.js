const { conn, syncAndSeed, models: { Department, Employee} } = require('./db');
const express = require('express');
const app = express();

app.get('/api/departments', async(req, res, next) => {
    try{
        res.send(await Department.findAll({
            include: [ 
                {
                    model: Employee,
                    as: 'manager'
                }
            ]
        }));
    }
    catch(ex){
        next(ex);
    }
});


app.get('/api/employees', async(req, res, next) => {
    try{
        res.send(await Employee.findAll({
            include: [
                { model: Employee,
                as: 'supervisor' 
                },
                Employee, //=== { model: Employee, //this creates array of all employees that belong to sup
                // as: 'supervisees'
                // }
                Department
            ]
        }));
    }
    catch(ex){
        next(ex);
    }
});


const init = async() => {
    try {
        await conn.authenticate();
        await syncAndSeed();
        const port = process.env.PORT || 3000;
        app.listen(port, ()=> console.log(`listening on port ${port}`));
    }
    catch(ex){
        console.log(ex);
    }
};

init(); 