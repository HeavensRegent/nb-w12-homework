let { prompt } = require('inquirer');
let mysql = require('mysql2/promise');
const util = require('util');

let departments = [];
let employees = [];
let roles = [];

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db'
});

// // node native promisify
// const query = util.promisify(connection.query).bind(connection);

async function manageEmployees() {
    let option = await prompt(optionQuestions);

    let cliOption = cliOptions[option.option];
    if(cliOption.questions.length > 0)
    {
        let response = await prompt(cliOption.questions);
        await cliOption.execute(response);
    }
    else
    {
        await cliOption.execute();
    }
}

let optionQuestions = [
    {
        type: 'list',
        name: 'option',
        message: "What do you want to do?",
        choices: [
            "Update Employee's Manager",
            "View Manager's Employees",
            "View Department Budget",
            "Add Department",
            "View Departments",
            "Update Department",
            "Delete Department",
            "Add Role",
            "View Roles",
            "Update Role",
            "Delete Role",
            "Add Employee",
            "View Employees",
            "Update Employees",
            "Delete Employees",
            "Exit"
        ]
    }
];

let cliOptions = {
    "Update Employee's Manager": {
        questions: ["Which Employee do you want to update the Manager of?", "Who do you want the employee's new manager to be?"],
    },
    "View Manager's Employees": {
        questions: ["Whos employees do you want to see?"],
    },
    "View Department Budget": {
        questions: ["What department do you want to see?"],
    },
    "Add Department": {
        questions: [{
            message: "Department Name",
            type: 'input',
            name: 'name'
        }],
        execute: async (dep) => {
            console.log(dep);
            let result = await callQuery(department.createItem(dep));
            return result;
        }
    },
    "View Departments": {
        questions: [],
        execute: async () => {
            let result = await callQuery(department.viewItems(manageEmployees));
            return result;
        }
    },
    "Update Department": {
        questions: [{
            message: "Which Department do you want to update?",
            type: 'rawlist',
            name: 'departmentId',
            choices: async () => {
                await callQuery(department.viewItems());
                return departments.map(dep => {return {name: dep.name, value: dep.id}})
            }
        }, 
        {
            message: "Department Name",
            type: 'input',
            name: 'name'
        }],
    },
    "Delete Department": {
        questions: ["Which Department do you want to delete?"],
    },
    "Add Role": {
        questions: ["Role Title", "Role Salary", "Which department is this role in?"],
    },
    "View Roles": {
        questions: [],
    },
    "Update Role": {
        questions: ["Role Title", "Role Salary", "Which department should this role be in?"],
    },
    "Delete Role": {
        questions: ["Which role do you want to delete?"],
    },
    "Add Employee": {
        questions: ["First Name", "Last Name", "What role do they have?", "Who is their manager?"],
    },
    "View Employees": {
        questions: [],
    },
    "Update Employees": {
        questions: ["First name", "Last Name", "Role", "Manager"],
    },
    "Delete Employees": {
        questions: ["Which employee do you want to delete?"],
    },
    "Exit": {
        questions: [],
        execute: () => {
            return connection.end();
        }
    }
}

const department = {
    createItem(dept) {
        return [
            "INSERT INTO department SET ?",
            [dept],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    updateItem(deptId, dept) {
        return [
            "UPDATE department SET ? WHERE ?",
            [dept, {id: deptId}],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    viewItems(callback) {
        return [
            "SELECT * FROM department ORDER BY id ASC",
            function(err, res) {
                if(err) throw err;
                console.log('\nDepartments')
                for(i in res)
                    console.log(`Department ${i}: ${res[i].name}`);
                
                departments = res;
                
                return res;
            }
        ]
    },
    deleteItem(deptId) {
        return [
            "DELETE FROM department WHERE ?",
            {id: deptId},
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    }
}

async function callQuery(queryObj) {
    let queryResponse = await connection.execute(...queryObj);
    console.log(queryResponse);
    return queryResponse;
}

connection.connect(err => {
    if(err) throw err;
    manageEmployees();
});