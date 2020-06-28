const router = require('express').Router();
const multer = require('multer');
const StaffController = require('../controllers/staff');
const path = require('path');
const { pool } = require('../database/database_pg');

// For File upload
// const upload = multer({
//     dest: 'avatars',// -- removed so that multer doesnot store in filessytem
//     fileFilter(req, file, cb) {
//         if (!(file.originalname.endsWith('.png') || file.originalname.endsWith('.jpg'))) {
//             cb(new Error('Please uplaod a png or jpg file'));
//         }
//         cb(undefined, true);
//     }
// })

// Create staff
router.post('/staff', async (req, res) => {
    const staff = req.body;
    try {
        let result = await StaffController.create_staff(staff);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        console.log('Error while saving new staff :: ' + err);
        res.status(400).json({ success: false, data: null, error: err });
    }
});

// Update staff
router.patch('/staff/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const newDoc = await StaffController.update_staff(id, req.body);
        res.status(200).json({ success: true, data: newDoc });
    } catch (err) {
        console.log('Error while updating staff :: ' + err);
        res.status(400).json({ success: false, data: null });
    }
})

// Update staff department and designation
router.patch('/staff/department/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await StaffController.update_staff_department(id, req.body);
        res.status(200).json({ success: true, data: null });
    } catch {
        res.status(400).json({ success: false, data: null });
    }
});

// Read staff
router.get('/staffs', async (req, res) => {
    try {
        const staffs = await StaffController.get_staffs();
        res.status(200).json({ success: true, data: staffs });
    } catch (err) {
        // console.log('Error while getting staffs :: ' + err);
        res.status(400).json({ success: false, data: null, error: err });
    }
});

// Read a staff
router.get('/staff', async (req, res) => {
    try {
        const staff = await StaffController.get_staff(req.query.staff_id);
        res.status(200).json({ success: true, data: staff[0] });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }

});


// Get Staff Documents

router.get('/staff/documents/:id', async (req, res) => {
    try {
        const result = await StaffController.read_staff_documents(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});



router.get('/staffdeptdesg', async (req, res) => {
    try {
        const result = await StaffController.get_staff_dept_desg(req.query.staff_id.toLowerCase());
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.post('/assignmanager', async (req, res) => {
    try {
        await StaffController.assign_manager(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.get('/staffreporting', async (req, res) => {
    try {
        const result = await StaffController.get_staff_reporting_details(req.query.staff_id.toLowerCase());
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});







module.exports = router;