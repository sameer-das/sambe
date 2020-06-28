const router = require('express').Router();
const BatchController = require('../controllers/batch');
router.post('/batch', async (req, res) => {
    doc = req.body;
    try {
        const result = await BatchController.create_batch(doc);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/batch', async (req, res) => {
    try {
        const result = await BatchController.get_batches();
        res.status(200).json({ success: true, data: result });
    } catch(err){
        res.status(400).json({ success: false, data: null, error: err });

    }
});


module.exports = router;