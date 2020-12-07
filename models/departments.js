function createDepartment(dept) {
    return [
        "INSERT INTO department SET ?",
        [dept],
        function(err, res) {
            if(err) throw err;
            console.log(res.affectedRows + " product inserted!");
        }
    ]
}

function updateDepartment(deptId, dept) {
    return [
        "UPDATE department SET ? WHERE ?",
        [dept, {id: deptId}],
        function(err, res) {
            if(err) throw err;
            console.log(res.affectedRows + " product inserted!");
        }
    ]
}

function getDepartment(deptId) {
    return [
        "SELECT * FROM departments",
        function(err, res) {
            console.log(res);
        }
    ]
}

function deleteDepartment(deptId) {
    return [
        "DELETE FROM department WHERE ?",
        {id: deptId},
        function(err, res) {
            if(err) throw err;
            console.log(res.affectedRows + " products deleted!");
        }
    ]
}