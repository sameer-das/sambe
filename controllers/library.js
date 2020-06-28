const { pool } = require('../database/database_pg');


add_book = async (book) => {
    const client = await pool.connect();
    try {
        const queryText = `INSERT INTO public.book_master
            (book_id, subject, name, isbn, edition, author, publisher, price, pages)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`
        parameters = [book.book_id, book.subject, book.name, book.isbn, book.edition, book.author, book.publisher, book.price, book.pages];
        await client.query(queryText, parameters);
    } catch (e) {
        console.log('Error while adding book!');
        console.log(e);
        throw e;
    } finally {
        await client.release();
    }
}

get_book_search = async (search) => {
    const client = await pool.connect();
    let result;

    try {
        const queryText = `select id_book, book_id, subject, name, isbn, edition, author, publisher, price, pages,
                issued,last_issued_to,last_issued_on,last_issued_till
                from public.book_master
                where 
                lower(book_id) like lower(('%${search}%')) or 
                lower(publisher) like lower(('%${search}%')) or
                lower(name) like lower(('%${search}%')) and status = 1`;
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while getting book by search!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_book_fromid = async (book_id) => {
    const client = await pool.connect();
    let result;
    try {
        const queryText = `select id_book, book_id, subject, name, isbn, edition, author, publisher, price, pages,
                issued,last_issued_to,last_issued_on
                from public.book_master
                where 
			    lower(book_id) = $1 and issued=false and status=1`;
        const { rows } = await client.query(queryText, [book_id]);
        result = rows;
        console.log(rows);
    } catch (e) {
        console.log('Error while getting book by id!');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_user_book_history = async (id_user, user_type = 'student') => {
    const client = await pool.connect();
    let book_history;
    const queryText = `SELECT id_transaction, bt.id_book,book_id, name, isbn, edition, 
        author, publisher , issued_on, issued_till
        FROM public.book_transactions bt 
        inner join public.book_master bm on bt.id_book = bm.id_book
        where bt.status = 1 and bm.status = 1 and id_person = $1 and person_type=$2`;
    try {
        const { rows } = await client.query(queryText, [id_user, user_type]);
        book_history = rows;
    } catch (e) {
        console.log('Error while getting user book transaction history!');
        console.log(e)
        throw e;
    } finally {
        client.release();
    }
    return book_history;
}

issue_book = async (transactions) => {
    const client = await pool.connect();
    try {
        // BEGIN THE TRANSACTION
        await client.query('BEGIN');
        // STATEMENT 1
        // console.log('BEGIN');
        const str = transactions.map(x => {
            return JSON.stringify(Object.values(x)).replace('[', '(').replace(']', ')')
        });

        const str2 = str.join(',').replace(/"/g, "'");
        // console.log(str2);
        const queryText = `insert into book_transactions 
        (id_book, id_person, issued_on,issued_till, issued_by, person_type) values ${str2}`;

        await client.query(queryText);
        // console.log('STATEMENT 1 Executed Successfully');

        // STATEMENT 2
        // console.log('STATEMENT 2 Execution Started');
        let updateQuery;
        transactions.forEach(async element => {
            updateQuery = `update book_master set last_issued_to = $1, last_issued_on = $2, last_issued_till=$5,
            issued = true, last_issued_person_type = $4 where id_book = $3`;
            await client.query(updateQuery, [element.id_person, element.issued_on, element.id_book, element.person_type, element.issued_till]);
            // console.log('FORLOOP - STATEMENT Executed Successfully');
        });
        // console.log('STATEMENT 2 Executed Successfully');
        // COMMIT THE TRANSACTION
        await client.query('COMMIT');
        // console.log('COMMITED');
    } catch (e) {
        // ROLLBACK THE TRANSACTION
        console.log('Error while adding library transaction');
        console.log(e);
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

}

get_books_transactions = async (book_id, status) => {
    const client = await pool.connect();
    let result;
    try {
        let queryTextStudent = `select bm.id_book, bm.book_id, bm.name as title, bm.isbn, bm.edition, bm.author, bm.publisher,
            bm.issued,bm.last_issued_to,bm.last_issued_on,
            bt.id_transaction,bt.id_person,bt.issued_on,bt.issued_till,bt.issued_by,
            bt.returned_on, bt.returned_to,bt.status,bt.person_type,
            sm.id_student as id_person,sm.name as person_name, sm.student_id as person_id,sm.phone as person_phone, sm.email_o as person_email
            from public.book_master bm
            inner join book_transactions bt on bm.id_book = bt.id_book
            inner join student_master sm on bt.id_person = sm.id_student
            where lower(bm.book_id) = $1 and person_type = 'student'`;
        if (status === 'active')
            queryTextStudent += ` and bt.status = 1`;

        let queryTextStaff = `select bm.id_book, bm.book_id, bm.name as title, bm.isbn, bm.edition, bm.author, bm.publisher,
            bm.issued,bm.last_issued_to,bm.last_issued_on,
            bt.id_transaction,bt.id_person,bt.issued_on,bt.issued_till,bt.issued_by,
            bt.returned_on, bt.returned_to,bt.status,bt.person_type,
            sm.id_staff as id_person,sm.name as person_name, sm.staff_id as person_id,sm.mobile as person_phone, sm.email as person_email
            from public.book_master bm
            inner join book_transactions bt on bm.id_book = bt.id_book
            inner join staff_master sm on bt.id_person = sm.id_staff
            where lower(bm.book_id) = $1 and person_type = 'staff'`
        if (status === 'active')
            queryTextStaff += ` and bt.status = 1`;
        const queryText = queryTextStudent + ' UNION ALL ' + queryTextStaff;
        const { rows } = await client.query(queryText, [book_id]);
        result = rows;
    } catch (e) {
        console.log('Error while get_book_currentmapping');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

return_book = async (book_return_data) => {

    const client = await pool.connect();
    try {
        // BEGIN THE TRANSACTION
        await client.query('BEGIN');

        let queryText = `update book_transactions set status = 0, returned_on = current_date, return_remarks = $3,
                returned_to = $1 where id_transaction = $2`;
        await client.query(queryText, [book_return_data.returned_to, book_return_data.id_transaction, book_return_data.return_remark]);

        queryText = `update book_master set issued = false where id_book = $1`;
        await client.query(queryText, [book_return_data.id_book]);

        // COMMIT THE TRANSACTION
        await client.query('COMMIT');
    } catch (e) {
        // ROLLBACK THE TRANSACTION
        console.log('Error while returning book');
        console.log(e);
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}


update_book_details = async (updated_book) => {
    const client = await pool.connect();
    try {
        const queryText = `update book_master set book_id=$1, subject=$2, name=$3, isbn=$4, 
        edition=$5, author=$6, publisher=$7, price=$8, pages=$9, modified_on = now(), modified_by =$10 where id_book=$11 and status = 1`;
        parameters = [updated_book.book_id, updated_book.subject, updated_book.name,
        updated_book.isbn, updated_book.edition, updated_book.author,
        updated_book.publisher, updated_book.price, updated_book.pages,
        updated_book.modified_by, updated_book.id_book];
        await client.query(queryText, parameters)
    } catch (e) {
        console.log('Error while updating book');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
}

delete_book = async (deleted_book) => {
    const client = await pool.connect();
    let message = null;
    try {
        // console.log(deleted_book);
        const available = await get_books_transactions(deleted_book.book_id.toLowerCase(), 'active');
        // console.log(available)
        if (available.length == 0) {
            const queryText = `update book_master set status=0, modified_on = now(), 
            modified_by =$1 where id_book=$2 and status = 1`;
            const parameters = [deleted_book.modified_by, deleted_book.id_book];
            await client.query(queryText, parameters);
            message = 'success'
        } else {
            message = 'Cannot delete the book. Book is mapped to a user!'
        }

    } catch (e) {
        console.log('Error while deleting book');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return message;
}


get_books_all_transactions = async (params) => {
    const client = await pool.connect();
    let result;
    try {
        let queryTextStudent = `select bm.book_id, bm.name as title,
            bt.issued_on,bt.issued_till,bt.issued_by,
            bt.returned_on, bt.returned_to,
            bt.person_type, sm.name as person_name, sm.student_id as person_id
            from public.book_master bm
            inner join book_transactions bt on bm.id_book = bt.id_book
            inner join student_master sm on bt.id_person = sm.id_student
            where lower(bm.book_id) ='${params.book_id.toLowerCase()}' and person_type = 'student' 
            and bt.issued_on >= '${params.start_date}' and bt.issued_on <= '${params.end_date}' `;

        let queryTextStaff = `select bm.book_id, bm.name as title, 
            bt.issued_on,bt.issued_till,bt.issued_by,
            bt.returned_on, bt.returned_to,
            bt.person_type, sm.name as person_name, sm.staff_id as person_id
            from public.book_master bm
            inner join book_transactions bt on bm.id_book = bt.id_book
            inner join staff_master sm on bt.id_person = sm.id_staff
            where lower(bm.book_id) ='${params.book_id.toLowerCase()}' and person_type = 'staff'
            and bt.issued_on >= '${params.start_date}' and bt.issued_on <= '${params.end_date}' `;

        const queryText = 'select * from (' + queryTextStudent + ' UNION ALL ' + queryTextStaff + ')  as bigquery order by issued_on desc';
        // console.log(queryText);
        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while get_books_all_transactions');
        console.log(e);
        throw e;
    } finally {
        client.release();
    }
    return result;
}

get_users_all_transactions = async (params) => {
    const client = await pool.connect();
    let result;

    try {
        let queryText;
        if (params.user_type === 'student') {
            queryText = `select bm.book_id, bm.name as title,
                bt.issued_on,bt.issued_till,bt.issued_by,
                bt.returned_on, bt.returned_to,
                bt.person_type, sm.name as person_name, sm.student_id as person_id
                from public.book_master bm
                inner join book_transactions bt on bm.id_book = bt.id_book
                inner join student_master sm on bt.id_person = sm.id_student
                where lower(sm.student_id) = '${params.user_id.toLowerCase()}' and person_type = 'student' 
                and bt.issued_on >= '${params.start_date}' and bt.issued_on <= '${params.end_date}'
                order by bt.issued_on desc `;
        } else {
            queryText = `select bm.book_id, bm.name as title, 
            bt.issued_on,bt.issued_till,bt.issued_by,
            bt.returned_on, bt.returned_to,
            bt.person_type, sm.name as person_name, sm.staff_id as person_id
            from public.book_master bm
            inner join book_transactions bt on bm.id_book = bt.id_book
            inner join staff_master sm on bt.id_person = sm.id_staff
            where lower(sm.staff_id) = '${params.user_id.toLowerCase()}' and person_type = 'staff'
            and bt.issued_on >= '${params.start_date}' and bt.issued_on <= '${params.end_date}
            order by bt.issued_on desc '`;
        }

        const { rows } = await client.query(queryText);
        result = rows;
    } catch (e) {
        console.log('Error while getting user all book transaction history!');
        console.log(e)
        throw e;
    } finally {
        client.release();
    }
    return result;
}

module.exports = {
    add_book,
    get_book_search,
    get_user_book_history,
    get_book_fromid,
    get_books_transactions,
    issue_book,
    return_book,
    update_book_details,
    delete_book,
    get_books_all_transactions,
    get_users_all_transactions 
}