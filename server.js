// const express = require('express');
const { Pool } = require('pg');
const inquirer = require("inquirer");

// const app = express();

// Express middleware
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

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
const addRoleQs =[
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
];

// inquirer prompts to add department
const addDeptQs = 
[
  {
    type: "input",
    message: "What is the name of the department?",
    name: "dept",
  }
];

// inquirer prompts to add employee
const addEmpQs = 
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
 }
];

const addManager =
[
  {
    type:"list",
    message: "Who is the employee's manager?",
    name: "manager",
    choices: [ ] //GET from employee/manager db
 }
];

// inquirer prompts to update employee
const updateEmpQs = 
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
    const sql = `SELECT roles.title, roles.salary, departments.dept_name AS department FROM roles
    LEFT JOIN departments ON departments.id = roles.department`
    ;
    pool.query(sql, (err, response) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      //console.log(response.rows);
      const roles = response.rows;
      console.table(roles)
      askQuestions();
    });
};

// GET and display departments table
const displayDepts = function() {
    const sql = `SELECT departments.dept_name AS departments FROM departments`
    pool.query(sql, (err, response) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const depts = response.rows;
      console.table(depts)
      askQuestions();
    });
};

// GET and display employee table
const displayEmployees = function(){
    const sql = `SELECT employees.first_name, employees.last_name, roles.title, departments.dept_name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager  FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department = departments.id LEFT JOIN employees manager ON manager.id = employees.manager_id`
    pool.query(sql, (err, response) => {
      if (err) {
        console.log(err.message );
        return;
      }
      const emps = response.rows;
      console.table(emps)
      askQuestions();
    });
};

//add role
const addRole = function() {
  addRoleQs[2].choices = [];
  const sql = `SELECT * FROM departments`;
  pool.query(sql, (err, response) => {
    if (err) {
      console.log(err.message);
      return;
    }
    const role_table = response.rows;
    let roles  = [];
    for (let i = 0; i < role_table.length; i++) {
      roles[i] = role_table[i].dept_name;
    }
    addRoleQs[2].choices = roles;
    inquirer.prompt(addRoleQs).then((response) => {
      //console.log(response);
      
      for (let i = 0; i < role_table.length; i++) {
        if(response.roleDept == role_table[i].dept_name) {
          console.log(role_table[i])
          response.roleDept = role_table[i].id;
          break;
        }
      }
      postRoles(response);
    }); 
  });
  
};

// POST to roles table
const postRoles = function(response) {
  console.log("response", response)
  const sql = `INSERT INTO roles (title, department, salary)
    VALUES ($1, $2, $3)`;
  const params = [ response.role, parseInt(response.roleDept), parseInt(response.salary) ];
  //console.log(response);
  //console.log(params);
  //process.exit();
  // params should have [ "Role Title", 3, 100000 ];
  pool.query(sql, params, (err, result) => {
    if (err) {
      console.log(err.message);
      process.exit();
    }
     askQuestions();
   });

};


const addDept = function() {
    inquirer.prompt(addDeptQs).then((response) => {
      postDept(response);
    });
    };

// POST to departments table
const postDept = function(response) {
    const sql = `INSERT INTO departments (dept_name)
      VALUES ($1)`;
    const params = [response.dept];
  
    pool.query(sql, params, (err, result) => {
      if (err) {
        console.log(err.message );
        process.exit();
      }
      askQuestions();
    });
  };

const addEmp = function(){
  addEmpQs[2].choices = [];
  const sql = `SELECT * FROM roles`;
  pool.query(sql, (err, response) => {
    if (err) {
      console.log(err.message);
      return;
    }
    const emp_table = response.rows;
    let emps  = [];
    for (let i = 0; i < emp_table.length; i++) {
      emps[i] = emp_table[i].title;
    }
    addEmpQs[2].choices = emps;
    inquirer.prompt(addEmpQs).then((response) => {
      //console.log(response);
      
      for (let i = 0; i < emp_table.length; i++) {
        if(response.empRole == emp_table[i].title) {
          response.empRole = emp_table[i].id;
          break;
        }
      }
      postEmp(response);
    }); 
  });

}

const getRole = function(id) {
  const sql = `SELECT * FROM roles WHERE id = $1`;
  const params = [id];
    pool.query(sql, params, (err, response) => {
      if (err) {
        console.log(err.message);
        return;
      }
      console.log("getRole(): ", response)
      return response;
    })
};

// POST to employees table
const postEmp = function(response) {
    const sql1 = `SELECT * FROM employees`;
    pool.query(sql1, (err, empResponse) => {
      if (err) {
        console.log(err.message);
        return;
      }
      const emp_table = empResponse.rows;
      emp_table.unshift({manger_id:null})
      //console.log(emp_table)
      let emps  = [];
      for (let i = 0; i < emp_table.length; i++) {
        emps[i] = emp_table[i].first_name + emp_table[i].last_name;
      }
      addManager[0].choices = emps;
      inquirer.prompt(addManager).then((empResponse) => {
        //console.log(empResponse);
        
        for (let i = 0; i < emp_table.length; i++) {
          if(empResponse.empRole == emp_table[i].first_name + emp_table[i].last_name) {
            empResponse.empRole = emp_table[i].id;
            break;
          }
        }
        const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
        VALUES ($1, $2, $3, $4)`;
        const params = [response.fname, response.lname, parseInt(response.empRole), parseInt(empResponse.manager)];
        console.log(response.fname);
        console.log(response.lname);
        console.log(response.empRole);
        console.log(empResponse.manager)
    
        pool.query(sql, params, (err, result) => {
          if (err) {
            console.log(err.message);
            process.exit();
          }
          askQuestions();
        });
      }); 
    });
    
  };

const updateEmp = function(){
  updateEmpQs[0].choices = [];
  const sql = `SELECT * FROM employees`;
  pool.query(sql, (err, response) => {
    if (err) {
      console.log(err.message);
      return;
    }
    const emp_table = response.rows;
    let emps  = [];
    for (let i = 0; i < emp_table.length; i++) {
      emps[i] = emp_table[i].fname, emp_table[i].lname;
    }
    addEmpQs[2].choices = emps;
    inquirer.prompt(addEmpQs).then((response) => {
      //console.log(response);
      
      for (let i = 0; i < emp_table.length; i++) {
        if(response.empRole == emp_table[i].title) {
          response.empRole = emp_table[i].id;
          break;
        }
      }
      putEmp(response);
    }); 
  });
};

// PUT to employees table
const putEmp = function() {
    const sql = `UPDATE employees SET employee = $1 WHERE id = $2`;
    const params = [req.body];
  
    pool.query(sql, params, (err, result) => {
      if (err) {
        console.log(err.message );
        process.exit();
      } else if (!result.rowCount) {
        console.log('Employee not found');
        process.exit();
      } else {
        res.json({
          message: `Updated employee's role`,
          data: req.body,
          changes: result.rowCount
        });
        askQuestions();
      }
    });
};

function askQuestions() {
  inquirer.prompt(menu).then((response) => {
    if(response.first === "View All Roles") {
      displayRoles();
    } else if(response.first === "View All Departments") {
      displayDepts();
    } else if (response.first === "View All Employees") {
      displayEmployees();
    } else if (response.first === "Add Role") {
      addRole();
    } else if(response.first === "Add Department") {
      addDept();
    } else if(response.first === "Add Employee") {
      addEmp();
    } else if(response.first === "Update Employee Role") {
      inquirer.prompt(updateEmp).then((response) => {
        putEmp(response);
        askQuestions();
      }); 
    } else if(response.first === "Quit") {
      process.exit();
    } else {
      console.log("What did you do? That wasn't even an option.");
    }
  })
};

askQuestions();