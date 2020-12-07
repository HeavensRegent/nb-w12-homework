let { prompt } = require('inquirer');
let mysql = require('mysql2/promise');
const util = require('util');

let connection;

async function start() {
    connection = await mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: 'root',
        password: '',
        database: 'employee_db'
    });
    manageEmployees();
}
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

            manageEmployees();
            return result;
        }
    },
    "View Departments": {
        questions: [],
        execute: async () => {
            let result = await callQuery(department.viewItems());
            
            console.log('\nDepartments')
            for(i in result)
                console.log(`Department ${result[i].id}: ${result[i].name}`);
            
            manageEmployees();

            return result;
        },
    },
    "Update Department": {
        questions: [{
            message: "Which Department do you want to update?",
            type: 'rawlist',
            name: 'department',
            choices: async () => {
                let departments = await callQuery(department.viewItems());
                return departments.map(dep => {return {name: dep.name, value: dep}})
            }
        }, 
        {
            message: "Department Name",
            type: 'input',
            name: 'name',
            default: (answers) => answers.department.name
        }],
        execute: async (dep) => {
            let result = await callQuery(department.updateItem(dep.department.id, dep.name))
            manageEmployees();
            return result;
        }
    },
    "Delete Department": {
        questions: [{
            message: "Which Department do you want to delete?",
            type: 'rawlist',
            name: 'departmentId',
            choices: async () => {
                let departments = await callQuery(department.viewItems());
                return departments.map(dep => {return {name: dep.name, value: dep.id}})
            }
        }],
        execute: async (dep) => {
            let result = await callQuery(department.deleteItem(dep.departmentId))
            manageEmployees();
            return result;
        }
    },
    "Add Role": {
        questions: [{
            message: "Role Title",
            type: 'input',
            name: 'title'
        },
        {
            message: "Role Salary",
            type: 'input',
            name: 'salary'
        },
        {
            message: "Which department is this role in?",
            type: 'rawlist',
            name: 'departmentId',
            choices: async () => {
                let departments = await callQuery(department.viewItems());
                return departments.map(dep => {return {name: dep.name, value: dep.id}})
            }
        }],
        execute: async (newRole) => {
            console.log(newRole);
            let result = await callQuery(role.createItem(newRole));

            manageEmployees();
            return result;
        }
    },
    "View Roles": {
        questions: [],
        execute: async () => {
            let result = await callQuery(role.viewItems());
            
            console.log('\nRoles')
            for(i in result)
                console.log(`Role ${result[i].id}: ${result[i].title} Salary(${result[i].salary}) Dept:${result[i].department_id}`);
            
            manageEmployees();

            return result;
        },
    },
    "Update Role": {
        questions: [{
            message: "Which Role do you want to update?",
            type: 'rawlist',
            name: 'role',
            choices: async () => {
                let roles = await callQuery(role.viewItems());
                return roles.map(role => {return {name: role.title, value: role}})
            }
        },
        {
            message: "Role Title",
            type: 'input',
            name: 'title',
            default: (answers) => answers.role.title
        },
        {
            message: "Role Salary",
            type: 'input',
            name: 'salary',
            default: (answers) => answers.role.salary
        },
        {
            message: "Which department is this role in?",
            type: 'rawlist',
            name: 'departmentId',
            choices: async () => {
                let departments = await callQuery(department.viewItems());
                return departments.map(dep => {return {name: dep.name, value: dep.id}})
            },
            default: (answers) => answers.role.departmentId
        }],
        execute: async (updatedRole) => {
            let result = await callQuery(role.updateItem(updatedRole.role.id, updatedRole))
            manageEmployees();
            return result;
        }
    },
    "Delete Role": {
        questions: [{
            message: "Which Role do you want to delete?",
            type: 'rawlist',
            name: 'roleId',
            choices: async () => {
                let roles = await callQuery(role.viewItems());
                return roles.map(role => {return {name: role.title, value: role.id}})
            }
        }],
        execute: async (deletingRole) => {
            let result = await callQuery(role.deleteItem(deletingRole.roleId))
            manageEmployees();
            return result;
        }
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
            "INSERT INTO department (name) VALUES (?)",
            [dept.name]
        ]
    },
    viewItems() {
        return ["SELECT * FROM department ORDER BY id ASC"];
    },
    updateItem(deptId, dept) {
        return [
            "UPDATE department SET name = ? WHERE id = ?",
            [dept, deptId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    deleteItem(deptId) {
        return [
            "DELETE FROM department WHERE id = ?",
            [deptId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    }
}
const role = {
    createItem(role) {
        return [
            "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
            [role.title, role.salary, role.departmentId]
        ]
    },
    viewItems() {
        return ["SELECT * FROM role ORDER BY id ASC"];
    },
    updateItem(roleId, {title, salary, departmentId}) {
        return [
            "UPDATE role SET title = ?, salary = ?, department_id = ? WHERE id = ?",
            [title, salary, departmentId, roleId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    deleteItem(roleId) {
        return [
            "DELETE FROM role WHERE id = ?",
            [roleId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    }
}
const employee = {
    createItem(dept) {
        return [
            "INSERT INTO department (name) VALUES (?)",
            [dept.name]
        ]
    },
    viewItems() {
        return ["SELECT * FROM department ORDER BY id ASC"];
    },
    updateItem(deptId, dept) {
        return [
            "UPDATE department SET name = ? WHERE id = ?",
            [dept, deptId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    deleteItem(deptId) {
        return [
            "DELETE FROM department WHERE id = ?",
            [deptId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    }
}

async function callQuery(queryObj) {
    let [rows, fields] = await connection.execute(...queryObj);
    return rows;
}

start();
// connection.connect(err => {
//     if(err) throw err;
//     manageEmployees();
// });