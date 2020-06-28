const router = require('express').Router();
const LibraryController = require('../controllers/library');


router.post('/book', async (req, res) => {
    const book = req.body;
    try {
        await LibraryController.add_book(book);
        res.status(201).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/book/:book_id', async (req, res) => {
    try {
        const result = await LibraryController.get_book_fromid(req.params.book_id.toLowerCase());
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});


router.get('/book/search/:searchparameter', async (req, res) => {
    const search = req.params.searchparameter;
    try {
        const result = await LibraryController.get_book_search(search.toLowerCase().trim());
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.patch('/book', async (req, res) => {
    try {
        await LibraryController.update_book_details(req.body);
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.patch('/book/delete', async (req, res) => {
    try {
        const message = await LibraryController.delete_book(req.body);
        if (message === 'success')
            return res.status(200).json({ success: true, data: null });
        else
            return res.status(200).json({ success: false, data: null, message });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/transaction/active', async (req, res) => {
    console.log(res.query)
    try {
        const result = await LibraryController.get_user_book_history(req.query.id_user, req.query.user_type);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.post('/transaction/issuebook', async (req, res) => {
    try {
        await LibraryController.issue_book(req.body);;
        res.status(201).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});
router.post('/transaction/returnbook', async (req, res) => {
    try {
        await LibraryController.return_book(req.body);;
        res.status(200).json({ success: true, data: null });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});


router.get('/transaction/book', async (req, res) => {
    try {
        console.log(req.query)
        const result = await LibraryController.get_books_transactions(req.query.book_id.toLowerCase(), req.query.status.toLowerCase());
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});


router.post('/libraryreport/book', async (req, res) => {
    try {
        const result = await LibraryController.get_books_all_transactions(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})

router.post('/libraryreport/user', async (req, res) => {
    try {
        const result = await LibraryController.get_users_all_transactions(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
})












module.exports = router;