const router = require('express').Router();
const RoomController = require('../controllers/room');

router.get('/campus', async (req, res) => {
    try {
        const result = await RoomController.get_campus_details();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});


router.post('/rooms', async (req, res) => {
    doc = req.body;
    try {
        await RoomController.create_room(doc);
        res.status(201).json({ success: true, data: null });
    } catch(err){
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.get('/rooms', async (req, res) => {
    try {
        const result = await RoomController.get_rooms();
        res.status(200).json({ success: true, data: result });
    } catch(err){
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.patch('/rooms/:id', async (req, res) => {
    id_room =  req.params.id;
    doc = req.body;
    try {
        await RoomController.update_room(id_room, doc);
        res.status(200).json({ success: true, data: null });
    } catch(err){
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/rooms/:id', async (req, res) => {
    id_room =  req.params.id;
    try {
        const result = await RoomController.get_room(id_room);
        res.status(200).json({ success: true, data: result });
    } catch(err){
        res.status(400).json({ success: false, data: null, error: err });
    }
})

module.exports = router;