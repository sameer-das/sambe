const router = require('express').Router();
const AcademicController = require('../controllers/academic');

router.post('/academic/awardingbody', async (req, res) => {
    doc = req.body;
    try {
        await AcademicController.create_awarding_body(doc);
        res.status(201).json({ success: true, data: null });
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }

});


router.get('/academic/awardingbody', async (req, res) => {
    try {
        const result = await AcademicController.get_awarding_body();
        res.status(200).json({ success: true, data: result });
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
});

router.post('/academic/academicdepartment', async (req, res) => {
    doc = req.body;
    try {
        await AcademicController.create_academic_department(doc);
        res.status(201).json({ success: true, data: null });
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
});

router.get('/academic/academicdepartment', async (req, res) => {
    try {
        const result = await AcademicController.get_academic_departments();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});


router.post('/academic/course', async (req, res) => {
    doc = req.body;
    try {
        const result = await AcademicController.create_course(doc);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/academic/course', async (req, res) => {
    try {
        const result = await AcademicController.get_courses();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});


router.patch('/academic/course/:id', async (req, res) => {
    try {
        await AcademicController.update_course(req.params.id, req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})


router.get('/documentmaster', async (req, res) => {
    try {
        const result = await AcademicController.read_document_master();
        res.status(200).json({ success: true, data: result });
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
})

router.get('/subjects/:courseid', async (req, res) => {
    try {
        const result = await AcademicController.get_subjects_from_courseid(req.params.courseid);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/documentmapping/:courseid', async (req, res) => {
    try {
        const result = await AcademicController.get_documents_from_courseid(req.params.courseid);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.post('/mapcoursestaff', async (req,res) => {
    try {
        await AcademicController.map_course_staff(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.get('/mapcoursestaff', async (req,res) => {
    try {        
        const result = await AcademicController.get_map_course_staff(req.query.id_course);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.get('/staffmappedcourse', async (req,res) => {
    try {        
        const result = await AcademicController.get_staff_mapped_courses(req.query.id_course);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.post('/removemapcoursestaff', async (req,res) => {
    try {        
        console.log(req.body)
        await AcademicController.remove_course_staff_mapping(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})




module.exports = router;