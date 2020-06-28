const { pool } = require('../database/database_pg');


create_batch = async (batch) => {
    const client = await pool.connect();
    try {
        queryText = 'insert into batches (name, id_course , start_date) values ($1,$2,$3)';
        parameters = [batch.name, batch.course, batch.start_date];
        await client.query(queryText, parameters);
    } catch (e) {
        console.log('Error while creating batch!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}

get_batches = async () => {
    const client = await pool.connect();
    let result;
    try {
        queryText = `select id_batch,b.name as batch_name,start_date,c.id_course, c.name as course_name 
            from batches b inner join courses c on b.id_course = c.id_course
            where b.status = 1 and c.status = 1 `;
        const {rows} = await client.query(queryText);
        result = rows;
    }  catch (e) {
        console.log('Error while reading batches!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
    return result;
}




module.exports = { create_batch, get_batches }