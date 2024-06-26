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
    department INTEGER,
    salary INTEGER,
    FOREIGN KEY (department)
    REFERENCES departments(id)
    ON DELETE SET NULL
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE SET NULL,
    manager_id INTEGER,
    FOREIGN KEY (manager_id)
    REFERENCES employees(id)
    ON DELETE SET NULL

);
