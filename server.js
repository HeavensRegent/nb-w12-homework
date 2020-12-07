const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db'
});

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
            "Delete Employees"
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
        questions: ["Department Name"],
    },
    "View Departments": {
        questions: [],
    },
    "Update Department": {
        questions: ["Which Department do you want to update?", "Department Name"],
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
    }

}