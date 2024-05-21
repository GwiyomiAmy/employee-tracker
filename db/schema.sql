\c postgres;

DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

\c employees_db;

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    department INT,
    salary INT,
    FOREIGN KEY (department)
    REFERENCES departments(id)
    ON DELETE SET NULL
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    employee_title VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    salary INT,
    manager VARCHAR(100) NOT NULL
    FOREIGN KEY (employee_title)
    REFERENCES roles(title)
    ON DELETE SET NULL,
    FOREIGN KEY (department)
    REFERENCES departments(dept_name)
    ON DELETE SET NULL,
    FOREIGN KEY (salary)
    REFERENCES roles(salary)
    ON DELETE SET NULL,
);
