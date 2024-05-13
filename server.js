const express = require('express');
const inquire = require('inquire')
const { pool } = require('pg');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

pool.connect();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//inquire prompts
const askQuestions = inquire.prompt(
  [
    {
      type: "list",
      message: "What would you like to do?",
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
  ]
).then((response) => {
  if(response.first === "View All Roles"){
    // GET and display roles table
    app.get('/api/roles', (req, res) => {
      const sql = `SELECT id, title, dept_name AS department FROM departments, salary`;
    
      pool.query(sql, (err, { rows }) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: 'success',
          data: rows
        });
      });
    });
  } else if(response.first === "View All Departments"){
    // GET and display departments table
    app.get('/api/departments', (req, res) => {
      const sql = `SELECT id, dept_name AS department FROM departments`;
    
      pool.query(sql, (err, { rows }) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: 'success',
          data: rows
        });
      });
    });
  } else if(response.first === "View All Employees"){
    // GET and display employee table
    app.get('/api/employees', (req, res) => {
      const sql = `SELECT employees.id, employees.first_name AS first name, employees.last_name AS last name, roles.title FROM roles AS title, departments.dept_name FROM departments AS department, roles.salary FROM roles AS salary, employees.manager`;
      pool.query(sql, (err, { rows }) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: 'success',
          data: rows
        });
      });
    });
  } else if(response.first === "Add Role"){
    // inquire prompts to add role
    inquire.prompt(
      [
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
          choices: [] //GET from department db
       }
      ]
    ).then((response) => {
      // POST to roles table
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
        });
      });
    })
  } else if(response.first === "Add Department"){
    // inquire prompts to add department
    inquire.prompt(
      [
        {
          type: "input",
          message: "What is the name of the department?",
          name: "dept",
        }
      ]
    ).then((response) => {
      // POST to departments table
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
        });
      });
    })
  } else if(response.first === "Add Employee"){
    // inquire prompts to add employee
    inquire.prompt(
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
      ]
    ).then((response) => {
      // POST to employees table
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
        });
      });
    })
  } else if(response.first === "Update Employee Role"){
    // inquire prompts to update employee
    inquire.prompt(
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
      ]
    ).then((response) => {
      // PUT to employees table
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
          }
        });
      });
    })
  } else if(response.first === "Quit"){
    //somehow end
  } else{
    // Default response for any other request (Not Found)
    app.use((req, res) => {
      res.status(404).end();
    });
  }
})
