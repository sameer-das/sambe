const { pool } = require('../database/database_pg');



create_awarding_body = async (awardingBody) => {
    const client = await pool.connect();
    const queryText = `insert into awarding_body (name) values ($1)`;

    try {
        await client.query(queryText, [awardingBody.name])
    } catch (e) {
        console.log('Error while creating awarding body!');
        console.log(e)
        throw e;
    } finally {
        client.release();
    }
}

get_awarding_body = async () => {
    const client = await pool.connect();
    const queryText = `SELECT id_awarding_body, name FROM public.awarding_body where status = 1`;
    let result;
    try {
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading awarding bodies!');
        console.log(e)
        throw e;
    } finally {
        client.release();
    }
    return result;
}

create_academic_department = async (academic_department) => {
    const client = await pool.connect();
    const queryText = `insert into academic_department (name, id_awarding_body) values ($1,$2)`;

    try {
        await client.query(queryText, [academic_department.name, academic_department.id_awarding_body])
    } catch (e) {
        console.log('Error while creating academic department!');
        console.log(e)
        throw e;
    } finally {
        client.release();
    }
}

get_academic_departments = async () => {
    const client = await pool.connect();
    const queryText = `select id_academic_department,ad.name as department_name,ab.name as awarding_body_name,ad.id_awarding_body from academic_department ad left join awarding_body ab on ad.id_awarding_body = ab.id_awarding_body
            where ad.status = 1 and ab.status = 1`;
    let result;
    try {
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading academic departments!');
        console.log(e)
        throw e;
    } finally {
        client.release();
    }
    return result;
}

read_document_master = async () => {
    const client = await pool.connect();
    const queryText = `select id_document,document_name from document_master where status = 1`;
    let result;
    try {
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading document master!');
        console.log(e)
        throw e;
    } finally {
        client.release();
    }
    return result;
}







create_course = async (course) => {
    const client = await pool.connect();
    // console.log(course);
    let id_course;
    try {
        // BEGIN THE TRANSACTION
        await client.query('BEGIN');
        // STATEMENT 1 (Insert Course Details)
        let queryText = `insert into courses (name, id_department , id_awarding_body, course_incharge_id , 
    course_duration , course_duration_unit , course_fee , course_fee_unit) values 
    ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_course`;

        let parameters = [course.course_name, course.id_department, course.id_awarding_body, course.course_in_charge_staffid,
        course.course_duration, course.course_duration_unit, course.course_fee, course.course_fee_unit]

        const { rows } = await client.query(queryText, parameters);
        id_course = rows[0].id_course;

        // STATEMENT 2 (Insert Subject Details)

        const str = course.subjects.map(x => {
            x.id_course = id_course;
            return JSON.stringify(Object.values(x)).replace('[', '(').replace(']', ')')
        });
        const str2 = str.join(',').replace(/"/g, "'");
        // console.log(str2);
        queryText = 'insert into subjects (subject_name, subject_code, subject_duration, id_course) values ' + str2;
        // console.log(queryText);
        if (course.subjects.length > 0)
            await client.query(queryText);

        // STATEMENT 3 (Insert document course mapping)
        const str3 = course.required_documents.map(x => {
            return '(' + x + ',' + id_course + ')';
        });
        const str4 = str3.join(',').replace(/"/g, "'");
        // console.log(str4);
        queryText = 'insert into mapping_course_document (id_document,id_course) values ' + str4;
        await client.query(queryText);

        // COMMIT  THE TRANSACTION
        await client.query('COMMIT');
    } catch (e) {
        // ROLLBACK THE TRANSACTION
        await client.query('ROLLBACK');
        console.log('Error while creating the course :: ', e);
        throw e;
    } finally {
        await client.release();
    }
    return id_course;
}


update_course = async (id, course) => {
    const client = await pool.connect();
    console.log(course);
    try {
        // BEGIN THE TRANSACTION
        await client.query('BEGIN');

        // STATEMENT 1 (Update Course Details)
        let queryText = `update courses set name=$1, id_department=$2, id_awarding_body=$3, course_incharge_id=$4,
            course_duration=$5, course_duration_unit=$6, course_fee=$7, course_fee_unit=$8, modified_on=now()
            where id_course=$9 and status=1`;
        let parameters = [course.course_name, course.department, course.awarding_body, course.course_in_charge_staffid,
        course.course_duration, course.course_duration_unit, course.course_fee, course.course_fee_unit, +id];

        await client.query(queryText, parameters);
        // console.log('1 Finished');

        // STATEMENT 2 (Update old Subjects status = 0)

        queryText = `update subjects set status = 0 where id_course = $1`;
        parameters = [+id]
        await client.query(queryText, parameters);
        // console.log('2 Finished');
        // STATEMENT 3 (Inserting new Subjects)

        const str = course.subjects.map(x => {
            x.id_course = id;
            return JSON.stringify(Object.values(x)).replace('[', '(').replace(']', ')')
        });
        const str2 = str.join(',').replace(/"/g, "'");
        console.log(str2);
        queryText = 'insert into subjects (subject_name, subject_code, subject_duration, id_course) values ' + str2;
        console.log(queryText);

        await client.query(queryText);
        // console.log('3 Finished');
        // STATEMENT 4 (make all the document mapping to stats 0)

        queryText = 'update mapping_course_document  set status = 0 where id_course= $1';
        parameters = [+id];
        await client.query(queryText, parameters);
        // console.log('4 Finished');

        // STATEMENT 5 (Insert new mapping)

        const str3 = course.required_documents.map(x => {
            return '(' + x + ',' + id + ')';
        });
        const str4 = str3.join(',').replace(/"/g, "'");
        console.log(str4);
        queryText = 'insert into mapping_course_document (id_document,id_course) values ' + str4;
        // console.log('Query 5 ::' + queryText);
        await client.query(queryText);
        // console.log('5 Finished');
        // COMMIT TRNSACTION
        await client.query('COMMIT');
        // console.log('Commit Finished');

    } catch (e) {
        // ROLLBACK THE TRANSACTION
        await client.query('ROLLBACK');
        console.log('Error while updating the course :: ', e);
        throw e;
    } finally {
        await client.release();
    }
}

map_course_staff = async(staff_course) => {
    const client = await pool.connect();
    try {
        const queryText = `insert into mapping_course_staff (id_staff,id_course,remarks) values ($1,$2,$3)`;
        const parameters = [staff_course.id_staff,staff_course.id_course,staff_course.remarks];
        await client.query(queryText, parameters);
    } catch (e) {
        console.log('Error while mapping course staff!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}

get_map_course_staff = async (id_course) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_mapping,staff_id,name from mapping_course_staff mcs
            inner join staff_master sm on sm.id_staff = mcs.id_staff 
            where mcs.status = 1 and sm.status = 1 and id_course = $1`;
        const parameters = [id_course];
        const {rows} = await client.query(queryText, parameters);
        result = rows;
    } catch (e) {
        console.log('Error while getting mapping course staff!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}



remove_course_staff_mapping = async (body) => {
    console.log(body);
    const client = await pool.connect();
    try {
        const queryText = `update mapping_course_staff set status = 0 where id_mapping = $1 and status = 1`;
        const parameters = [body.id_mapping];
        await client.query(queryText, parameters);
    } catch (e) {
        console.log('Error while removing mapping course staff!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}



get_courses = async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select c.*,ad.name as department_name,ab.name as awarding_body_name, sm.name as course_incharge_name from courses c 
        left join academic_department ad on id_department = id_academic_department 
        left join awarding_body ab on c.id_awarding_body = ab.id_awarding_body 
        left join staff_master sm on c.course_incharge_id = sm.id_staff 
        where c.status = 1 and ad.status=1 and ab.status = 1 and sm.status = 1`;

        const { rows } = await client.query(queryText);
        // console.log(rows);
        result = rows;
    } catch (e) {
        console.log('Error while reading courses!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_subjects_from_courseid = async (id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_course,subject_name,subject_code,subject_duration from subjects where id_course = $1 and status = 1`;
        const { rows } = await client.query(queryText, [+id]);
        result = rows;
    } catch (e) {
        console.log('Error while reading subjects from course id!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_documents_from_courseid = async (id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select mcd.id_course,dm.id_document,dm.document_name from mapping_course_document mcd 
        left join document_master dm on dm.id_document = mcd.id_document 
        where mcd.id_course = $1 and mcd.status = 1 and dm.status = 1`;
        const { rows } = await client.query(queryText, [+id]);
        result = rows;
    } catch (e) {
        console.log('Error while reading documents from course id!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}


get_staff_mapped_courses  = async (staff_id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select sm.name as staff_name,sm.id_staff,sm.staff_id,mcs.id_course,c.name as course_name,
			id_mapping,remarks,c.id_department,ad.name as department_name
			from staff_master sm
			inner join mapping_course_staff mcs on mcs.id_staff = sm.id_staff
			inner join courses c on c.id_course = mcs.id_course
			inner join academic_department ad on c.id_department = ad.id_academic_department
			where c.status = 1 	and mcs.status = 1 	and sm.status = 1
			and lower(sm.staff_id) = $1 `;
        const { rows } = await client.query(queryText, [staff_id.toLowerCase()]);
        result = rows;
    } catch (e) {
        console.log('Error while reading coursed for staff!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

module.exports = {
    create_awarding_body,
    get_awarding_body,
    create_academic_department,
    get_academic_departments,
    read_document_master,
    create_course,
    get_courses,
    get_subjects_from_courseid,
    get_documents_from_courseid,
    update_course,
    map_course_staff,
    get_map_course_staff,
    remove_course_staff_mapping,
    get_staff_mapped_courses,
}