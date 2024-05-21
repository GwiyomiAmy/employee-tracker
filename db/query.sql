SELECT 
   employees.id, 
   employees.firstName, 
   employees.lastName, 
   roles.title, 
   departments.dept_name, 
   roles.salary, 
   CONCAT(manager.firstName+ " " + manager.lastName)
FROM employees
LEFT JOIN roles ON roles.id = employees.id
LEFT JOIN departments ON department.dept_name = role.department
-- JOIN employees AS manager ON employee.manager = manager


FOREIGN KEY (role_id) REFERENCES role(id) on DELETE CASCADE, manager_id INTEGER
FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL