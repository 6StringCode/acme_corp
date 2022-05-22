const Sequelize = require('sequelize');
const { STRING, UUID, UUIDV4 } = Sequelize; 
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db');
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
})

const Department = conn.define('department', {
    name: {
        type: STRING(20)
    }
})

const Employee = conn.define('employee', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name: {
        type: STRING(20)
    }
});

Department.belongsTo(Employee, { as: 'manager' });
Employee.hasMany(Department, { foreignKey: 'managerId' }); //assigning the foreign insures that there's only one (manager) id

const syncAndSeed = async() => {
    await conn.sync({ force: true });
    const [moe, lucy, hr, engineering] = await Promise.all([
        Employee.create({ name: 'moe' }),
        Employee.create({ name: 'lucy' }),
        Department.create({ name: 'hr' }),
        Department.create({ name: 'engineering' }),
    ]);

    hr.managerId = lucy.id;
    await hr.save();
    //console.log(JSON.stringify(hr, null, 2)); //this stringifies, and additional paramaters make it show up neatly like an object

}; 

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