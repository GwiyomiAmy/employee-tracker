SELECT 
   employees.id, 
   employees.first_name AS firstName, 
   employees.last_name AS lastName, 
   employees.employee_title AS title
   CONCAT (manager.first_name+ " " + manager.last_name) AS manager
FROM employees
LEFT JOIN roles ON roles.id = employees.id
LEFT JOIN departments ON department.dept_name = role.department
LEFT JOIN employees AS manager ON employee.manager = manager.id


-- FOREIGN KEY (role_id) REFERENCES role(id) on DELETE CASCADE
-- FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL