const { pool } = require('../database/database_pg');


create_staff = async (staff) => {
    const client = await pool.connect();

    queryText = `insert into staff_master (staff_id, name , mobile , emergency_contact , email ,
    gender , bloodgroup , dob , permanent_address , current_address , married ,
    spouse_detail ,  past_med_history, doj, created_by) 
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning *`;

    parameters = [staff.staff_id, staff.name, staff.mobile, staff.emergency_contact, staff.email,
    staff.gender, staff.bloodgroup, staff.dob, staff.permanent_address, staff.current_address, staff.married,
    staff.spouse_detail, staff.past_med_history, staff.doj, staff.created_by];

    let result;
    try {
        const { rows } = await client.query(queryText, parameters);
        // console.log(rows);
        result = rows[0];
    } catch (e) {
        console.log('Error while saving new staff :: ', e);
        throw e;
    } finally {
        client.release();
    }

    return result;
}


get_staffs = async () => {
    const client = await pool.connect();
    const queryText = `SELECT id_staff, staff_id, sm.name, mobile, emergency_contact, email, gender, 
        bloodgroup, dob, permanent_address, current_address, married, 
        spouse_detail, sm.department_id, sm.designation_id, past_med_history, 
        sm.status, doj, dol, sm.created_by, sm.modified_by, sm.created_on, sm.modified_on,
        dep.name as department_name, des.designation_name as designation_name from staff_master  sm
        left join departments dep on id_department = sm.department_id 
        left join designations des on id_designation = sm.designation_id 
        and des.id_department = sm.department_id`;
    let result;
    try {
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading staffs! :: ', e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_staff = async (staff_id) => {
    const client = await pool.connect();
    const queryText = `SELECT id_staff, staff_id, sm.name, mobile, emergency_contact, email, gender, 
    bloodgroup, dob, permanent_address, current_address, married, 
    spouse_detail, sm.department_id, sm.designation_id, past_med_history, 
    sm.status, doj, dol, sm.created_by, sm.modified_by, sm.created_on, sm.modified_on,
    dep.name as department_name, des.designation_name as designation_name from staff_master  sm
    left join departments dep on id_department = sm.department_id 
    left join designations des on id_designation = sm.designation_id 
    and des.id_department = sm.department_id where lower(sm.staff_id) = $1`;
    let result;
    try {
        const { rows } = await client.query(queryText, [staff_id.toLowerCase()]);
        result = rows;
    } catch (e) {
        console.log('Error while reading staff ! :: ', e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}



update_staff = async (id, staff) => {
    const client = await pool.connect();
    let result;
    let query = ['update staff_master set '];
    parameters = [];
    set = []
    Object.keys(staff).forEach((current, i) => {
        set.push(current + '=$' + (i + 1));
    });
    query.push(set.join(', '));
    queryText = query.join(' ') + ' where id_staff = ' + id + ' returning *';
    // console.log(queryText);

    parameters = Object.values(staff);
    // console.log(parameters);

    try {
        let { rows } = await client.query(queryText, parameters);
        result = rows[0];
    } catch (e) {
        console.log(e);
        throw e;
    } finally {
        client.release()
    }
    return result;
}


update_staff_department = async (id, updatedDoc) => {
    const client = await pool.connect();

    const queryText = `update staff_master set department_id = $1, designation_id = $2, modified_by =$4, modified_on = now() where id_staff = $3`;
    const parameters = [updatedDoc.department_id, updatedDoc.designation_id, +id, updatedDoc.modified_by];
    // console.log(parameters);
    try {
        await client.query(queryText, parameters);
    } catch (e) {
        console.log('Error while updating department of staff with id_staff :: ' + id);
        console.log(e);
        throw e;
    } finally {
        client.release();
    }

}





read_staff_documents = async (id_staff) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_file,uniqid,identifier,originalname,mimetype, size
         from file_master where id_person = $1 and status = 1 and flag='staff'`;
        const { rows } = await client.query(queryText, [id_staff]);
        result = rows;
    } catch (e) {
        console.log('Error while reading documents for a staff from DB');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}





get_staff_dept_desg = async (staff_id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select staff_id,id_staff, sm.name as staff_name,
        dept.name as dept_name,desg.designation_name as desg_name from staff_master sm 
        left join departments dept on sm.department_id = dept.id_department 
        left join designations desg on sm.designation_id = desg.id_designation 
        and sm.department_id = desg.id_department
        where lower(staff_id) = $1  and sm.status =1 `;
        const { rows } = await client.query(queryText, [staff_id.toLowerCase()]);
        result = rows;
    } catch (e) {
        console.log('Error while reading dept and desg for a staff from DB');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}


assign_manager = async (mapping) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // STATEMENT 1
        let queryText = `update manager_mapping set status = 0, 
        mapped_till = current_date where lower(staff_id) = $1 and status = 1`;
        await client.query(queryText, [mapping.staff_id.toLowerCase()]);

        // STATEMENT 2
        queryText = `insert into manager_mapping 
        (staff_id,manager_id,mapped_from,mapped_by) values ($1,$2,$3,$4)`;

        const parameters = [mapping.staff_id.toLowerCase(), mapping.manager_id.toLowerCase(), mapping.mapped_from, mapping.mapped_by]
        await client.query(queryText, parameters);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.log('Error while assigning manager to staff');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}


get_staff_manager = async (staff_id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select mm.staff_id,manager_id,sm.name as manager_name,mapped_from from manager_mapping mm
        inner join staff_master sm on lower(mm.manager_id) = lower(sm.staff_id)
        where lower(mm.staff_id) = $1 and mm.status = 1 and sm.status = 1`;
        const { rows } = await client.query(queryText, [staff_id.toLowerCase()]);
        result = rows;
    } catch (e) {
        console.log('Error while reading staff manager from DB');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_staff_reportees = async (manager_id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select mm.manager_id,mm.staff_id,sm.name as staff_name,mm.mapped_from from manager_mapping mm
        inner join staff_master sm on lower(sm.staff_id) = lower(mm.staff_id)
        where lower(mm.manager_id) = $1 and sm.status = 1 and mm.status = 1 `;
        const { rows } = await client.query(queryText, [manager_id.toLowerCase()]);
        result = rows;
    } catch (e) {
        console.log('Error while reading staff reportees from DB');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_staff_reporting_details = async (staff_id) => {
    let result = new Object();
    try {
        result.staff_details = await get_staff_dept_desg(staff_id.toLowerCase());
        result.staff_manager = await get_staff_manager(staff_id.toLowerCase());
        result.staff_reportees = await get_staff_reportees(staff_id.toLowerCase());
    } catch (e) {
        console.log('Error while reading staff reporting details');
        console.log(e);
        throw e;
    }
    return result;
}

module.exports = {
    create_staff, update_staff,
    get_staffs, get_staff,
    update_staff_department,
    read_staff_documents,
    get_staff_dept_desg,
    assign_manager,
    get_staff_reporting_details
}