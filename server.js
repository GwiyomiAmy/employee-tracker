const express = require('express');
const { Pool } = require('pg');
const inquirer = require("inquirer");

const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const pool = new Pool(
  {
    user: 'postgres',
    password: '12345',
    host: 'localhost',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
)

pool.connect();

//inquire prompts
const menu = [
  {
    type: "list",
    message: "What would you like to do",
    name: "first",
    choices: [
      "View All Roles", 
      "View All Departments", 
      "View All Employees", 
      "Add Role",
      "Add Department", 
      "Add Employee", 
      "Update Employee Role", 
      "Quit"]
  }
];

// inquire prompts to add role
const addRole =[
  {
    type: "input",
    message: "What is the name of the role?",
    name: "role",
  },
  {
    type: "input",
    message: "What is the salary of the role?",
    name: "salary",
  },
  {
    type:"list",
    message: "Which department does the role belong to?",
    name: "roleDept",
    choices: [`SELECT * FROM departments`] //GET from department db
  }
];

// inquirer prompts to add department
const addDept = 
[
  {
    type: "input",
    message: "What is the name of the department?",
    name: "dept",
  }
];

// inquirer prompts to add employee
const addEmp = 
[
  {
    type: "input",
    message: "What is the Employee's first name?",
    name: "fname",
  },
  {
    type: "input",
    message: "What is the employee's last name?",
    name: "lname",
  },
  {
    type:"list",
    message: "What is the employee's role?",
    name: "empRole",
    choices: [] //GET from role db
 },
 {
   type:"list",
   message: "Who is the employee's manager?",
   name: "manager",
   choices: ["None", ] //GET from employee/manager db
}
];

// inquirer prompts to update employee
const updateEmp = 
[
  {
    type:"list",
    message: "Which employee's role do you want to update?",
    name: "employee",
    choices: [] //GET from employee db
 },
 {
   type:"list",
   message: "Which role do you want to assign the selected employee?",
   name: "updateRole",
   choices: [] //GET from role db
}
];

// GET and display roles table
const displayRoles = function() {
  app.get('/api/roles', (req, res) => {
    const sql = `SELECT * FROM roles`
    //`SELECT id, title, dept_name AS department FROM departments, salary`
    ;
  
    pool.query(sql, (err, { rows }) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      });
      askQuestions();
    });
  });
};

// GET and display departments table
const displayDepts = function() {
  app.get('/api/departments', (req, res) => {
    const sql = `SELECT * FROM departments`
    //`SELECT id, dept_name AS department FROM departments`
    ;
  
    pool.query(sql, (err, { rows }) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      });
      askQuestions();
    });
  });
};

// GET and display employee table
const displayEmployees = function(){
  app.get('/api/employees', (req, res) => {
    const sql = `SELECT * FROM employees`
    //`SELECT employees.id, employees.first_name AS first name, employees.last_name AS last name, roles.title FROM roles AS title, departments.dept_name FROM departments AS department, roles.salary FROM roles AS salary, employees.manager`
    ;
    pool.query(sql, (err, { rows }) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      });
      askQuestions();
    });
  });
};

// POST to roles table
const postRoles = function() {
  app.post('/api/roles', ({ body }, res) => {
  const sql = `INSERT INTO roles (titles, department, salary)
    VALUES ($1)`;
  const params = [body];

  pool.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Added role to the database',
      data: body
     });
     askQuestions();
   });

 });
};

// POST to departments table
const postDept = function() {
  app.post('/api/department', ({ body }, res) => {
    const sql = `INSERT INTO departments (dept_name)
      VALUES ($1)`;
    const params = [body];
  
    pool.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'Added department to the database',
        data: body
      });
      askQuestions();
    });
  });
};

// POST to employees table
const postEmp = function() {
  app.post('/api/employee', ({ body }, res) => {
    const sql = `INSERT INTO employees (first_name, last_name, title, department, salary, manager)
      VALUES ($1)`;
    const params = [body];
  
    pool.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'Added employee to the database',
        data: body
      });
      askQuestions();
    });
  });
};

// PUT to employees table
const putEmp = function() {
  app.put('/api/employee/:id', (req, res) => {
    const sql = `UPDATE employees SET employee = $1 WHERE id = $2`;
    const params = [req.body];
  
    pool.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else if (!result.rowCount) {
        res.json({
          message: 'Employee not found'
        });
      } else {
        res.json({
          message: `Updated employee's role`,
          data: req.body,
          changes: result.rowCount
        });
        askQuestions();
      }
    });
  });
};

function askQuestions() {
  inquirer.prompt(menu).then((response) => {
    if(response.first === "View All Roles") {
      displayRoles();
      askQuestions();
    } else if(response.first === "View All Departments") {
      displayDepts();
      askQuestions();
    } else if (response.first === "View All Employees") {
      displayEmployees();
      askQuestions();
    } else if (response.first === "Add Role") {
      inquirer.prompt(addRole).then((response) => {
        postRoles(response);
      }); 
    } else if(response.first === "Add Department") {
      inquirer.prompt(addDept).then((response) => {
        postDept(response);
      }); 
    } else if(response.first === "Add Employee") {
      inquirer.prompt(addEmp).then((response) => {
        postEmp(response);
      }); 
    } else if(response.first === "Update Employee Role") {
      inquirer.prompt(updateEmp).then((response) => {
        putEmp(response);
      }); 
    } else if(response.first === "Quit") {
      inquirer.prompt.ui.close();
    } else {
      app.use((req, res) => {
        res.status(404).end();
      });
    }
  })
};

askQuestions();