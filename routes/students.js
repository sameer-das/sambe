const router = require('express').Router();
const StudentController = require('../controllers/student');


router.post('/student', async (req, res) => {
    const student = req.body;
    try {
        await StudentController.create_student(student);
        res.status(201).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.patch('/student/:id_student', async (req, res) => {
    try {
        await StudentController.update_student(req.params.id_student, req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/students', async (req, res) => {
    try {
        const result = await StudentController.get_students();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err })
    }
})

router.get('/student', async (req, res) => {
    try {
        const result = await StudentController.get_student(req.query.student_id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err })
    }
})

router.get('/student/documents/:id', async (req, res) => {
    try {
        const result = await StudentController.read_student_documents(req.params.id);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/studentcourse', async (req, res) => {
    try {
        const result = await StudentController.get_student_course_batch(req.query.id_student);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.post('/studentcourse', async (req, res) => {
    try {
        const result = await StudentController.add_student_course_batch(req.body);
        res.status(201).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.patch('/studentcoursedemap', async (req, res) => {
    try {
        console.log(req.body)
        await StudentController.remove_student_course_mapping(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})



router.get('/paymentmodes', async (req, res) => {
    try {
        const result = await StudentController.get_payment_modes();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/paymentunits', async (req, res) => {
    try {
        const result = await StudentController.get_payment_units();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.post('/payment', async (req, res) => {
    try {
        await StudentController.add_student_payment(req.body);
        res.status(201).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.post('/paymentdelete', async (req, res) => {
    try {
        await StudentController.delete_student_payment(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/payment', async (req, res) => {
    try {
        const result = await StudentController.get_student_payment(req.query.id_student);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})






router.post('/enquiry', async (req, res) => {
    try {
        // console.log(req.body);
        await StudentController.create_enquiry(req.body);
        res.status(201).json({ success: true, data: null });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/enquiry', async (req, res) => {
    try {
        const result = await StudentController.get_enquiries();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.get('/enquirydetails', async (req, res) => {
    try {
        const result = await StudentController.get_enquiry_details(req.query.id_enquiry);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.patch('/enquiry', async (req, res) => {
    try {
        await StudentController.update_enquiry(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.patch('/deleteenquiry', async (req, res) => {
    try {
        await StudentController.delete_enquiry(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

module.exports = router;