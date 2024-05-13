-- SELECT movies.movie_name AS movie, reviews.review
-- FROM reviews
-- LEFT JOIN movies
-- ON reviews.movie_id = movies.id
-- ORDER BY movies.movie_name;


SELECT employees.id, employee.firstName, employee.lastName, role.title, department.name, role.salary, manager.lastName
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON department.id = role.department_id
JOIN employee AS manager ON employee.manager_id = manager.id

CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) on DELETE CASCADE, manager_id INTEGER
CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE DET NULL
