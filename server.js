let { prompt } = require('inquirer');
let mysql = require('mysql2/promise');
const util = require('util');

let connection;

//Start and setup the connection
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

//Repeated method that will run many times
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

//Beginning prompt questions
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

//Each of the cli options with their questions and the the method that should be ran when they are complete
let cliOptions = {
    "Update Employee's Manager": {
        questions: [{
            message: "Which Employee do you want to update the Manager of?",
            type: 'rawlist',
            name: 'employee',
            choices: async () => {
                let employees = await callQuery(employee.viewItems());
                return employees.map(emp => {return {name: `${emp.firstName} ${emp.lastName}`, value: emp}})
            }
        },
        {
            message: "Who do you want the employee's new manager to be?",
            type: 'rawlist',
            name: 'managerId',
            choices: async () => {
                let employees = await callQuery(employee.viewItems());
                employees.unshift({firstName: 'None', lastName: '', id: 0});
                return employees.map(emp => {return {name: `${emp.firstName} ${emp.lastName}`, value: emp.id}})
            },
            default: (answers) => answers.employee.manager_id
        }],
        execute: async (emp) => {
            let result = await callQuery(employee.updateManager(emp.employee.id, emp))
            manageEmployees();
            return result;
        }
    },
    "View Manager's Employees": {
        questions: [{
            message: "Whos employees do you want to see?",
            type: 'rawlist',
            name: 'managerId',
            choices: async () => {
                let employees = await callQuery(employee.viewItems());
                return employees.map(emp => {return {name: `${emp.firstName} ${emp.lastName}`, value: emp.id}})
            }
        }],
        execute: async (manager) => {
            console.log(manager);
            let result = await callQuery(employee.getEmployees(manager.managerId));

            console.table(result.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {}));

            manageEmployees();
            return result;
        }
    },
    "View Department Budget": {
        questions: [{
            message: "Which Department do you want to see the budget for?",
            type: 'rawlist',
            name: 'department',
            choices: async () => {
                let departments = await callQuery(department.viewItems());
                return departments.map(dep => {return {name: dep.name, value: dep}})
            }
        }],
        execute: async (dep) => {
            let result = await callQuery(department.viewBudget(dep.department.id))
            console.log(result[0].budget);
            manageEmployees();
            return result;
        }
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
            
            console.table(result.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {}));
            
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
        questions: [{
            message: "First Name",
            type: 'input',
            name: 'firstName'
        },
        {
            message: "Last Name",
            type: 'input',
            name: 'lastName'
        },
        {
            message: "What role do they have?",
            type: 'rawlist',
            name: 'roleId',
            choices: async () => {
                let roles = await callQuery(role.viewItems());
                return roles.map(role => {return {name: role.title, value: role.id}})
            }
        },
        {
            message: "Who is their manager?",
            type: 'rawlist',
            name: 'managerId',
            choices: async () => {
                let employees = await callQuery(employee.viewItems());
                employees.unshift({firstName: 'None', lastName: '', id: 0});
                return employees.map(emp => {return {name: `${emp.firstName} ${emp.lastName}`, value: emp.id}})
            }
        }],
        execute: async (emp) => {
            console.log(emp);
            let result = await callQuery(employee.createItem(emp));

            manageEmployees();
            return result;
        }
    },
    "View Employees": {
        questions: [],
        execute: async () => {
            let result = await callQuery(employee.viewItems());

            console.table(result.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {}));

            manageEmployees();

            return result;
        },
    },
    "Update Employees": {
        questions: [{
            message: "Which Employee do you want to update?",
            type: 'rawlist',
            name: 'employee',
            choices: async () => {
                let employees = await callQuery(employee.viewItems());
                return employees.map(emp => {return {name: `${emp.firstName} ${emp.lastName}`, value: emp}})
            }
        },
        {
            message: "First Name",
            type: 'input',
            name: 'firstName',
            default: (answers) => answers.employee.firstName
        },
        {
            message: "Last Name",
            type: 'input',
            name: 'lastName',
            default: (answers) => answers.employee.lastName
        },
        {
            message: "What role do they have?",
            type: 'rawlist',
            name: 'roleId',
            choices: async () => {
                let roles = await callQuery(role.viewItems());
                return roles.map(role => {return {name: role.title, value: role.id}})
            },
            default: (answers) => answers.employee.role_id
        },
        {
            message: "Who is their manager?",
            type: 'rawlist',
            name: 'managerId',
            choices: async () => {
                let employees = await callQuery(employee.viewItems());
                employees.unshift({firstName: 'None', lastName:'', id: 0});
                return employees.map(emp => {return {name: `${emp.firstName} ${emp.lastName}`, value: emp.id}})
            },
            default: (answers) => answers.employee.manager_id
        }],
        execute: async (emp) => {
            let result = await callQuery(employee.updateItem(emp.employee.id, emp))
            manageEmployees();
            return result;
        }
    },
    "Delete Employees": {
        questions: [{
            message: "Which Employee do you want to delete?",
            type: 'rawlist',
            name: 'employeeId',
            choices: async () => {
                let employees = await callQuery(employee.viewItems());
                return employees.map(emp => {return {name: `${emp.firstName} ${emp.lastName}`, value: emp.id}})
            }
        }],
        execute: async (emp) => {
            let result = await callQuery(employee.deleteItem(emp.employeeId))
            manageEmployees();
            return result;
        }
    },
    "Exit": {
        questions: [],
        execute: () => {
            return connection.end();
        }
    }
}

//Department query methods
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
    },
    viewBudget(deptId) {
        return [
            "SELECT SUM(salary) as budget FROM department INNER JOIN role ON department.id = role.department_id WHERE department.id = ?",
            [deptId]
        ]
    }
}
//Role query methods
const role = {
    createItem(role) {
        return [
            "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
            [role.title, role.salary, role.departmentId]
        ]
    },
    viewItems() {
        return [`SELECT role.id, title, salary, dept.name as departmentName FROM role 
        INNER JOIN department dept ON role.department_id = dept.id ORDER BY role.id ASC`];
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
//Employee query methods
const employee = {
    createItem(emp) {
        return [
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
            [emp.firstName, emp.lastName, emp.roleId, emp.managerId]
        ]
    },
    viewItems() {
        return [`SELECT
        e.id as id, e.first_name as firstName, e.last_name as lastName,
        role.title as roleTitle, role.salary, dept.name as departmentTitle,
       CONCAT(manager.first_name, ' ', manager.last_name) as manager
 FROM employee as e
     LEFT JOIN role ON e.role_id = role.id
     LEFT JOIN department dept on role.department_id = dept.id
     LEFT JOIN employee manager on e.manager_id = manager.id
 ORDER BY e.first_name ASC`];
    },
    updateItem(empId, {firstName, lastName, roleId, managerId}) {
        return [
            "UPDATE employee SET first_name = ?, last_name = ?, role_id = ?, manager_id = ? WHERE id = ?",
            [firstName, lastName, roleId, managerId, empId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    updateManager(empId, {managerId}) {
        return [
            "UPDATE employee SET manager_id = ? WHERE id = ?",
            [managerId, empId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    deleteItem(empId) {
        return [
            "DELETE FROM employee WHERE id = ?",
            [empId],
            function(err, res) {
                if(err) throw err;
                return manageEmployees();
            }
        ]
    },
    getEmployees(empId) {
        return [
            `SELECT e.id as id, e.first_name as firstName, e.last_name as lastName,
            role.title as roleTitle, role.salary, dept.name as departmentTitle,
            CONCAT(manager.first_name, ' ', manager.last_name) as manager
            FROM employee as e
            LEFT JOIN role ON e.role_id = role.id
            LEFT JOIN department dept on role.department_id = dept.id
            LEFT JOIN employee manager on e.manager_id = manager.id
            WHERE e.manager_id = ? ORDER BY e.first_name ASC`,
            [empId]
        ]
    }
}

//Method that calls the query
async function callQuery(queryObj) {
    let [rows, fields] = await connection.execute(...queryObj);
    return rows;
}

start();