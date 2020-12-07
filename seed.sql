USE employee_db;

INSERT INTO department (name)
VALUES ('Human Resource'), ('IT');

INSERT INTO role (title, salary, department_id)
VALUES 
('Employment Specialist', 70365, 1),
('Coordinator', 55713, 1),
('Specialist', 49149, 1),
('Director', 97777, 1),
('Computer Programmer', 58343, 2),
('Quality Assurance Tester', 70000, 2),
('Web Developer', 72040, 2),
('IT Technician', 74664, 2),
('Software Engineer', 105090, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Rand', 'al''Thor', 4, 0),
('Nynaeve', 'al''Meara', 7, 9),
('Perrin', 'Aybara', 8, 9),
('Egwene', 'al''Vere', 5, 2),
('Mat', 'Cauthon', 6, 9),
('Elayne', 'Trakand', 1, 1),
('Aviendha', '', 2, 1),
('Elmindreda', 'Farshaw', 3, 1),
('Moiraine', 'Damodred', 9, 0);