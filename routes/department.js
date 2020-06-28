const router = require('express').Router();
const DepartmentController = require('../controllers/department');

// Create Department
router.post('/department', async (req, res) => {
    try {
        const result = await DepartmentController.create_department(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (e) {
        console.log(e);
        res.status(400).json({ success: false, data: null });
    }
})

// Read Departments
router.get('/department', async (req, res) => {
    try {
        const departments = await DepartmentController.get_departments();
        res.status(200).json({ success: true, data: departments });
    } catch (err) {
        console.log('Error while reading all departments :: ' + err);
        res.status(400).json({ success: false, data: null });
    }
});

// Read a Department
router.get('/department/:id', async (req, res) => {

});


// Update Department (Only name and department_id)
router.patch('/department', async (req, res) => {
    console.log(req.body);    
    try{
        await DepartmentController.update_department(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        console.log('Error while updating department :: ' + err);
        res.status(400).json({ success: false, data: null, error: err });
    }
});

// Delete Department
router.delete('/department/:id', async (req, res) => {

});


module.exports = router;