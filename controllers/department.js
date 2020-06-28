const { pool } = require('../database/database_pg');



create_department = async (department) => {
  const client = await pool.connect();
  try {
    // BEGIN THE TRANSACTION
    await client.query('BEGIN');
    // STATEMENT 1
    const queryText = `insert into departments (name, department_id, subdepartment, parent_department_id, created_by) 
      values ($1,$2,$3,$4,$5) RETURNING id_department`;
    const res = await client.query(queryText, [department.name, department.department_id, 
      department.isSubDepartment, department.parent_department, department.created_by]);

    const dept_id = res.rows[0].id_department;

    const str = department.designations.map(x => {
      x.department_id = dept_id;
      return JSON.stringify(Object.values(x)).replace('[', '(').replace(']', ')')
    });

    const str2 = str.join(',').replace(/"/g, "'");
    // console.log(str2);

    // STATEMENT 2
    const insertDesignation = 'INSERT INTO designations (designation_name, designation_id, id_department) VALUES ' + str2;
    await client.query(insertDesignation);

    // COMMIT THE TRANSACTION
    await client.query('COMMIT');

  } catch (e) {
    // ROLLBACK THE TRANSACTION
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    return 'OK';
  }
}

get_departments = async () => {
  const client = await pool.connect();
  const queryText = `select dep.id_department,department_id,name,dep.created_on,
  dep.subdepartment,dep.parent_department_id,
  id_designation,designation_name,designation_id from departments dep left join 
  designations desig on dep.id_department = desig.id_department
  where desig.status = 1 and dep.status = 1`;
  let result;
  try {
    const { rows } = await client.query(queryText);
    result = rows;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    client.release();
  }
  return result;
}

update_department = async (updated_department) => {
  const client = await pool.connect();
  try {
    // BEGIN THE TRANSACTION
    await client.query('BEGIN');

    // STATEMENT 1 -- Update the department 
    let queryText = `update departments set name = $1, department_id = $2, subdepartment = $3, 
      parent_department_id = $4, modified_by = $5, modified_on = now()
      where id_department = $6 and status = 1`;
    let parameters = [updated_department.name, updated_department.department_id,
    updated_department.isSubDepartment, updated_department.parent_department, updated_department.modified_by,
    updated_department.id_department];
    await client.query(queryText, parameters);
    console.log(`Updated Department`);

    // STATEMENT 2 -- update designations
    updated_department.designations_updated.forEach(async (current, index) => {
      queryText = `update designations set designation_name = $1, designation_id = $2,
        modified_by = $3, modified_on = now() where id_department = $4 and id_designation = $5`;
      parameters = [current.designation_name, current.designation_id, updated_department.modified_by,
      updated_department.id_department, current.id_designation];
      try {
        await client.query(queryText, parameters);
      } catch (e) {
        console.log('Error while updating desiganation :: ', e);
        throw e;
      }
      // console.log(`Updated Designation ${index}`);
    });

    // STATEMENT 3 -- delete designations
    updated_department.designations_deleted.forEach(async (current, index) => {
      queryText = `update designations set status = 0 ,modified_by = $1, modified_on = now() 
      where id_department = $2 and id_designation = $3`;
      parameters = [updated_department.modified_by, updated_department.id_department, current.id_designation];
      try {
        await client.query(queryText, parameters);
      } catch (e) {
        console.log('Error while deleting desiganation :: ', e);
        throw e;
      }
      // console.log(`Deleted Designation ${index}`);
    });

    // STATEMENT 4 -- Add new designations
    updated_department.designations_added.forEach(async (current, index) => {
      queryText = `INSERT INTO designations 
      (designation_name, designation_id, id_department, created_by) VALUES ($1,$2,$3,$4)`;
      parameters = [current.designation_name, current.designation_id, updated_department.id_department, updated_department.modified_by];
      try {
        await client.query(queryText, parameters);
      } catch (e) {
        console.log('Error while adding desiganation :: ', e);
        throw e;
      }
      // console.log(`Added Designation ${index}`);
    });

    // COMMIT THE TRANSACTION
    await client.query('COMMIT');
  } catch (err) {
    // ROLLBACK THE TRANSACTION
    console.log('Error while updating department!')
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { create_department, get_departments, update_department }