const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const uniqid = require('uniqid');


const { pool } = require('../database/database_pg');

const upload = multer().single('upload');

router.post('/upload', upload, async (req, res) => {
    // console.log(req.file);
    // console.log(req.body);
    try {
        await saveFileDetailsToDb(req);
        res.status(200).json({ success: true, data: null });
    } catch (e) {
        res.status(400).json({ success: false, error: e })
    }
});

router.get('/download/:uniqid', async (req, res) => {
    try {
        const result = await readFromDb(req.params.uniqid);
        console.log(result);
        console.log(result[0].mimetype);
        res.status(200).json({ success: true, originalname: result[0].originalname, data: result[0].content, mimetype: result[0].mimetype });
    } catch (err) {
        res.status(400).json({ success: false, data: null, err: err });
    }
});

router.get('/avatar/staff/:id', async (req, res) => {
    try {
        const result = await readAvatar(req.params.id, 'staff');
        res.set('Content-Type', result[0].mimetype);
        res.send(result[0].content);
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
});

router.get('/avatar/student/:id', async (req, res) => {
    try {
        const result = await readAvatar(req.params.id, 'student');
        res.set('Content-Type', result[0].mimetype);
        res.send(result[0].content);
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
});

router.get('/avatar/check/staff/:id', async (req, res) => {
    try {
        const result = await checkAvatar(req.params.id, 'staff');
        if (result.length == 0) {
            return res.status(404).json({ success: true, data: null });
        } else {
            return res.status(200).json({ success: true, data: result });
        }
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
});

router.get('/avatar/check/student/:id', async (req, res) => {
    try {
        const result = await checkAvatar(req.params.id, 'student');
        if (result.length == 0) {
            return res.status(404).json({ success: true, data: null });
        } else {
            return res.status(200).json({ success: true, data: result });
        }
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
});

router.delete('/deletedocument/:uniqid', async (req, res) => {
    try {
        await deleteFromDb(req.params.uniqid);
        res.status(200).json({ success: true, data: null });
    } catch (e) {
        res.status(400).json({ success: false, data: null, error: e });
    }
});


router.get('/policy', async (req, res) => {
    // console.log('in policy router get')
    try {
        const result = await read_policies();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

router.get('/notice', async (req, res) => {
    try {
        const result = await read_notices();
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, data: null, error: err });
    }
});

saveFileDetailsToDb = async (req) => {
    const client = await pool.connect();
    let queryText;
    let parameter;
    try {
        // console.log(req.body.identifier);
        if (req.body.identifier === 'Avatar') {
            //  Check if avatar exists..if exists then replace else add new 
            const exists = await checkAvatar(req.body.id_staff, req.body.flag);
            console.log(exists);
            if (exists.length > 0) {
                queryText = `update public.file_master set originalname=$1, mimetype = $2, size = $3, 
                        content =$4, modified_on=now() 
                        where id_person = $5 and uniqid = $6 and status =1`;
                const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 300 }).toBuffer();
                // console.log(buffer.byteLength);
                // console.log(buffer);
                parameter = [req.file.originalname, req.file.mimetype, buffer.byteLength, buffer, req.body.id_staff, exists[0].uniqid];
            } else {
                queryText = `INSERT INTO public.file_master(
                    id_person, uniqid, identifier, originalname, mimetype, size, content,flag)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`;
                const uid = uniqid('sam', 'et');
                const buffer = req.body.identifier === 'Avatar' ? await sharp(req.file.buffer).resize({ width: 300, height: 300 }).toBuffer() : req.file.buffer;
                // console.log(buffer.byteLength);
                // console.log(buffer);
                parameter = [req.body.id_staff, uid, req.body.identifier, req.file.originalname, req.file.mimetype, buffer.byteLength, buffer, req.body.flag];
            }
        } else {
            queryText = `INSERT INTO public.file_master(
                id_person, uniqid, identifier, originalname, mimetype, size, content,flag)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`;
            const uid = uniqid('sam', 'et');
            const buffer = req.body.identifier === 'Avatar' ? await sharp(req.file.buffer).resize({ width: 300, height: 300 }).toBuffer() : req.file.buffer;
            // console.log(buffer.byteLength);
            // console.log(buffer);
            parameter = [req.body.id_staff, uid, req.body.identifier, req.file.originalname, req.file.mimetype, buffer.byteLength, buffer, req.body.flag];
        }
        await client.query(queryText, parameter);
    } catch (e) {
        console.log('Error while saving file details to DB');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}

readAvatar = async (id, flag) => {
    const client = await pool.connect();
    let result;
    try {
        const query = `select mimetype,content from public.file_master where id_person = ${id} and identifier = 'Avatar' and status = 1 and flag = $1`;
        // console.log(qu/ery);

        const { rows } = await client.query(query, [flag]);
        result = rows;
    } catch (err) {
        console.log('Error while reading DB 0', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}

checkAvatar = async (id, flag) => {
    const client = await pool.connect();
    let result;
    try {
        const query = `select uniqid from public.file_master where id_person = ${id} and identifier = 'Avatar' and status = 1 and flag=$1`;
        const { rows } = await client.query(query, [flag]);
        result = rows;
    } catch (err) {
        console.log('Error while reading DB 1', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}



readFromDb = async (id) => {
    const client = await pool.connect();
    let result;
    try {
        const query = 'select content,mimetype,originalname from public.file_master where uniqid = $1 and status = 1';
        // console.log(query);
        const { rows } = await client.query(query, [id]);
        result = rows;
    } catch (err) {
        console.log('Error while reading DB 2 ', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}

deleteFromDb = async (id) => {
    const client = await pool.connect();
    try {
        const query = 'update public.file_master set status = 0, modified_on = now() where uniqid = $1 and status = 1';
        await client.query(query, [id]);
    } catch (err) {
        console.log('Error while updating DB in deleteFromDb ', err);
        throw err;
    } finally {
        await client.release();
    }
}


read_policies = async () => {
    // console.log('inside readpolicies')
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_file,uniqid,identifier,originalname,mimetype,size from public.file_master where status = 1 and flag='policy' `;
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (err) {
        console.log('Error while reading policies from DB :: ', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}

read_notices= async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_file,uniqid,identifier,originalname,mimetype,size,created_on from public.file_master where status = 1 and flag='notice' order by created_on desc`;
        const { rows }  = await client.query(queryText);
        result = rows;
    } catch (err) {
        console.log('Error while reading notices from DB :: ', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}



module.exports = router;