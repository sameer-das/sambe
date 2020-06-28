const { pool } = require('../database/database_pg');

get_campus_details = async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = 'select  id,id_campus,campus_name ,id_building ,building_name ,id_floor ,floor_name  from campus_master';
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while getting campus details!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }

    return result;
}



create_room = async (room) => {
    const client = await pool.connect();
    try {
        const queryText = 'insert into rooms (name , campus, building, floor) values ($1,$2,$3,$4)';
        const parameter = [room.name, room.campus, room.building, room.floor];
        await client.query(queryText, parameter);
    } catch (e) {
        console.log('Error while creating a new room!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}


get_rooms = async () => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_room,name,id_campus, campus_name,id_building,building_name,id_floor,floor_name 
                        from rooms inner join campus_master 
                        on campus = id_campus and building = id_building and floor = id_floor  
                        where campus_master.status = 1 and rooms.status = 1`;
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while reading rooms!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }

    return result;
}

update_room = async (id, room) => {
    const client = await pool.connect();
    try {
        const queryText = `update rooms set name=$1, campus=$2, building=$3,floor=$4 where id_room = $5`;
        const parameter = [room.name, room.campus, room.building, room.floor, +id];
        await client.query(queryText, parameter);
    } catch (e) {
        console.log('Error while udpating room details!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}

get_room = async (id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_room,name,id_campus, campus_name,id_building,building_name,id_floor,floor_name 
                        from rooms inner join campus_master 
                        on campus = id_campus and building = id_building and floor = id_floor  
                        where campus_master.status = 1 and rooms.status = 1 and rooms.id_room = $1`;
        const { rows } = await client.query(queryText, [+id]);
        result = rows;
    } catch (e) {
        console.log('Error while reading room with id ' + id);
        console.log(e);
        throw e;
    } finally {
        client.release();
    }

    return result;
}





module.exports = { get_campus_details, create_room, get_rooms, update_room, get_room }