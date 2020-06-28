const { pool } = require('../database/database_pg');

create_student = async (student) => {
    const client = await pool.connect();
    const queryText = `insert into public.student_master 
        (student_id, name, gender , dob, doj, dol,
        bloodgroup , nationality, phone, email_p , permanent_address, current_address, created_by)
        values
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`;
        // console.log(student.created_by)
    const parameters = [student.student_id, student.name, student.gender, student.dob,
    student.doj, student.dol, student.bloodgroup, student.nationality, student.phone,
    student.email_p, student.permanent_address, student.current_address, student.created_by];

    try {
        await client.query(queryText, parameters);
    } catch (err) {
        console.log('Error while inserting student :: ', err);
        throw err;
    } finally {
        await client.release();
    }
}

update_student = async (id_student, updated_student) => {
    const client = await pool.connect();
    const queryText = `update public.student_master  set
        student_id = $1, name = $2, gender = $3 , dob = $4, doj = $5,
        bloodgroup = $6 , nationality = $7, phone = $8, email_p = $9, email_o = $10,
        permanent_address = $11 , current_address = $12, modified_on = now(), modified_by = $13
        where id_student = ${id_student} and status = 1`;

    const parameters = [updated_student.student_id, updated_student.name, updated_student.gender, updated_student.dob,
    updated_student.doj, updated_student.bloodgroup, updated_student.nationality, updated_student.phone,
    updated_student.email_p, updated_student.email_o, updated_student.permanent_address, updated_student.current_address,
    updated_student.modified_by];

    try {
        await client.query(queryText, parameters);
    } catch (err) {
        console.log('Error while updating student :: ', err);
        throw err;
    } finally {
        await client.release();
    }
}

add_student_course_batch = async (student_course_batch) => {
    const client = await pool.connect();
    try {
        const queryText = `insert into mapping_student_course 
            (id_student, course, batch) values ($1,$2,$3)`;
        const parameters = [student_course_batch.id_student, student_course_batch.course, student_course_batch.batch]
        await client.query(queryText, parameters);
    } catch (err) {
        console.log('Error while adding student course batch :: ', err);
        throw err;
    } finally {
        await client.release();
    }
}

remove_student_course_mapping = async (removing) => {
    console.log(removing)
    const client = await pool.connect();
    try {
        const queryText = `update mapping_student_course set status = 0 where 
        id_mapping_student_course = $1 and status = 1`;
        const parameters = [removing.id]
        await client.query(queryText, parameters);
    } catch (err) {
        console.log('Error while removing mapping student course batch :: ', err);
        throw err;
    } finally {
        await client.release();
    }
}


get_student_course_batch = async (id_student) => {
    const client = await pool.connect();
    const queryText = `select msc.id_mapping_student_course,msc.id_student,msc.course,
        c.name as course_name, msc.batch,b.name as batch_name, b.start_date, b.end_date  from 
        mapping_student_course msc 
        inner join courses  c on c.id_course = msc.course
        inner join batches  b on b.id_batch = msc.batch
        where c.status = 1 and b.status = 1 and msc.status = 1 and msc.id_student = $1 `;
    let result;
    try {
        const { rows } = await client.query(queryText, [id_student]);
        result = rows;
    } catch (err) {
        console.log('Error while reading student course batch :: ', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}

get_students = async () => {
    const client = await pool.connect();
    const queryText = `select id_student, student_id, name, gender, phone, email_p 
        from public.student_master where status = 1`;
    let result;
    try {
        const { rows } = await client.query(queryText);
        result = rows;
        // console.log(result);
    } catch (err) {
        console.log('Error while reading all students :: ', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}


get_student = async (student_id) => {
    const client = await pool.connect();
    const queryText = `SELECT id_student, id_enquiry, student_id, name, gender, dob, doj, dol, 
        bloodgroup, nationality, phone, email_p, email_o, permanent_address, current_address, 
        status FROM public.student_master where status = 1 and lower(student_id) =$1 `;
    let result;
    try {
        const { rows } = await client.query(queryText, [student_id.toLowerCase()]);
        result = rows;
    } catch (err) {
        console.log('Error while reading student :: ', err);
        throw err;
    } finally {
        await client.release();
    }
    return result;
}


read_student_documents = async (id_student) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_file,uniqid,identifier,originalname,mimetype, size
         from file_master where id_person = $1 and status = 1 and flag='student'`;
        const { rows } = await client.query(queryText, [id_student]);
        result = rows;
    } catch (e) {
        console.log('Error while reading documents for a student from DB');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_payment_modes = async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_payment_mode, payment_mode from payment_mode`;
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading payment modes');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_payment_units = async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_payment_unit, payment_unit from payment_unit`;
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading payment units');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

add_student_payment = async (payment) => {
    const client = await pool.connect();
    try {
        const queryText = `insert into student_payment 
            (transaction_id , invoice_no, payment_mode, payment_amount, 
                payment_unit, payment_date, created_by,id_student, remarks) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
        const parameters = [payment.transaction_id, payment.invoice_no, payment.payment_mode, payment.payment_amount,
        payment.payment_unit, payment.payment_date, payment.created_by, payment.id_student, payment.remarks];
        await client.query(queryText, parameters);
    } catch (e) {
        console.log('Error while inserting payment details');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}

get_student_payment = async (id_student) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_student_payment,transaction_id,invoice_no,pm.payment_mode,
        payment_amount,pu.payment_unit,payment_date,created_by, created_on,id_student, sm.remarks from student_payment sm
        inner join payment_mode pm on sm.payment_mode = pm.id_payment_mode
        inner join payment_unit pu on sm.payment_unit = pu.id_payment_unit
        where status = 1 and id_student = $1`;
        const { rows } = await client.query(queryText, [id_student]);
        result = rows;
    } catch (e) {
        console.log('Error while reading student payments');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

delete_student_payment = async (delete_payment) => {
    const client = await pool.connect();
    try {
        const queryText = `update student_payment set status = 0, modified_by= $1, 
            modified_on = current_date where id_student_payment = $2`;
        await client.query(queryText, [delete_payment.modified_by, delete_payment.id_student_payment]);
    } catch (e) {
        console.log('Error while deleting student payment');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}











create_enquiry = async (enquiry) => {
    const client = await pool.connect();
    // console.log(enquiry)
    try {
        await client.query('BEGIN');
        // console.log('BEGIN')
        // STATEMENT 1 - Insert to student_enquiry
        let queryText = `insert into student_enquiry (student_name, course, batch, student_mobile,
            student_email, information_source, remarks, created_by) values 
            ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_enquiry`;
        let parameters = [enquiry.student_name, enquiry.course, enquiry.batch, enquiry.mobile,
        enquiry.email, enquiry.source_of_info, enquiry.remarks, enquiry.created_by];
        const { rows } = await client.query(queryText, parameters);
        const id_enquiry = rows[0].id_enquiry;
        // console.log('STATEMENT 1')
        if (enquiry.communications.length > 0) {
            enquiry.communications.forEach(async (current) => {

                queryText = `insert into enquiry_communication (id_enquiry, comm_date, comm_message, comm_by)  
                values ($1,$2,$3,$4)`;
                parameters = [id_enquiry, current.date, current.message, current.comm_by];
                try {
                    await client.query(queryText, parameters);
                } catch (er) {
                    console.log('Error in loop creating student enquiery :: ', er);
                    throw er;
                }
            });
        }
        // console.log('STATEMENT 2')
        await client.query('COMMIT');
        // console.log('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK');
        console.log('Error while creating student enquiry');
        console.log(e);
        throw e;
    } finally {
        // console.log('Finally')
        client.release();
    }
}

get_enquiries = async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_enquiry, student_name, courses.name as course, batches.name as batch, 
        student_mobile, student_email, se.created_by, se.created_on from student_enquiry se
        left join courses on courses.id_course = se.course
        left join batches on batches.id_batch = se.batch
        where se.status = 1 order by se.created_on desc limit 20`;
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading student enquiries');
        console.log(e);
        throw e;
    }
    return result;
}

get_enquiry_details = async (id_enquiry) => {
    const client = await pool.connect();
    let result = new Object();
    try {
        const queryText = `select id_enquiry, student_name,courses.id_course as id_course, 
        courses.name as course, batches.id_batch as id_batch, batches.name as batch, information_source, remarks,
        student_mobile, student_email, se.created_by, se.created_on, se.modified_by, se.modified_on from student_enquiry se
        left join courses on courses.id_course = se.course
        left join batches on batches.id_batch = se.batch
        where se.status = 1 --and courses.status = 1 and batches.status = 1        
        and id_enquiry = $1`;
        const { rows } = await client.query(queryText, [id_enquiry]);
        result.enquiry = rows[0];
        const communications = await get_enquiry_communication(id_enquiry);
        result.communications = communications;
    } catch (e) {
        console.log('Error while reading student enquiry details');
        console.log(e);
        throw e;
    }
    return result;
}

get_enquiry_communication = async (id_enquiry) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_enq_comm, id_enquiry, comm_date, comm_message, comm_by from enquiry_communication where id_enquiry = $1`;
        const { rows } = await client.query(queryText, [id_enquiry]);
        result = rows;
    } catch (e) {
        console.log('Error while reading student enquiry communications');
        console.log(e);
        throw e;
    }
    return result;
}


update_enquiry = async (udpated_enquiry) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // console.log('BEGIN')
        // STATEMENT 1 - Insert to student_enquiry
        let queryText = `update student_enquiry set student_name = $1, course = $2, batch = $3, student_mobile = $4,
            student_email =$5, information_source = $6, remarks = $7, modified_by = $8, modified_on = current_date 
            where id_enquiry = $9 and status = 1`;
        let parameters = [udpated_enquiry.student_name, udpated_enquiry.course, udpated_enquiry.batch, udpated_enquiry.mobile,
        udpated_enquiry.email, udpated_enquiry.source_of_info, udpated_enquiry.remarks, udpated_enquiry.modified_by,
        udpated_enquiry.id_enquiry];
        await client.query(queryText, parameters);

        // console.log('STATEMENT 1')
        if (udpated_enquiry.communications.length > 0) {
            udpated_enquiry.communications.forEach(async (current) => {
                queryText = `insert into enquiry_communication (id_enquiry, comm_date, comm_message, comm_by)  
                values ($1,$2,$3,$4)`;
                try {
                    parameters = [udpated_enquiry.id_enquiry, current.date, current.message, current.comm_by];
                    await client.query(queryText, parameters);
                } catch (er) {
                    console.log('Error in update enquiry loop :: ', er);
                    throw er;
                }
            });
        }
        // console.log('STATEMENT 2')
        await client.query('COMMIT');
        // console.log('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK');
        console.log('Error while updating student enquiry');
        console.log(e);
        throw e;
    } finally {
        // console.log('Finally')
        client.release();
    }
}

delete_enquiry = async (delete_enquiry) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // STATEMENT 1 - Insert to student_enquiry
        let queryText = `update student_enquiry set status = 0, modified_by = $1, modified_on = current_date 
            where id_enquiry = $2 and status = 1`;
        let parameters = [delete_enquiry.modified_by, delete_enquiry.id_enquiry];
        await client.query(queryText, parameters);

        // console.log('STATEMENT 2')
        queryText = `update enquiry_communication set status = 0 where id_enquiry = $1`;
        parameters = [delete_enquiry.id_enquiry];
        await client.query(queryText, parameters);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.log('Error while deleting student enquiry');
        console.log(e);
        throw e;
    } finally {
        // console.log('Finally')
        client.release();
    }
}

module.exports = {
    create_student,
    update_student,
    get_students,
    get_student,
    read_student_documents,
    get_payment_modes,
    get_payment_units,
    add_student_payment,
    get_student_payment,
    delete_student_payment,
    create_enquiry,
    get_enquiries,
    get_enquiry_details,
    update_enquiry,
    delete_enquiry,
    get_student_course_batch,
    add_student_course_batch,
    remove_student_course_mapping
}