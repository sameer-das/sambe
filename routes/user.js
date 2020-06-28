const router = require('express').Router();
const UserController = require('../controllers/user');
const { authenticate, authorize } = require('../middlewares/authentication');

router.post('/user', authenticate, async (req, res) => {
    try {
        await UserController.create_user(req.body);
        res.status(201).json({
            success: true,
            data: null,
            message: 'User created successfully!',
            error: undefined
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error creating the user!',
            error: err
        });
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const user = await UserController.find_user(req.body.username);
        if (user.length > 0) {
            const valid = await UserController.validate_password(req.body.username, req.body.password);
            if (valid) {
                const result = await UserController.get_user_role(req.body.username);
                return res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Login Success',
                    error: undefined
                })
            } else {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'Unauthorized User',
                    error: undefined
                });
            }
        } else {
            return res.status(404).json({
                success: false,
                data: null,
                message: 'User not found!',
                error: undefined
            });
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error loging in the user!',
            error: err
        });
    }
})

router.post('/role', authenticate, async (req,res) => {
    try {
        await UserController.create_role(req.body);
        res.status(200).json({
            success: true,
            data: null,
            message: 'Role Created Successfully',
            error: undefined
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error creating the role!',
            error: err
        });
    }
});

router.get('/roles', authenticate, async (req,res) => {
    try {
        const result = await UserController.get_roles();
        res.status(200).json({
            success: true,
            data: result,
            message: 'Success',
            error: undefined
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error getting the roles!',
            error: err
        });
    }
})

router.patch('/role', authenticate, async (req,res) => {
    try {
        await UserController.update_role(req.body);
        res.status(200).json({
            success: true,
            data: null,
            message: 'Success',
            error: undefined
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error updating the role!',
            error: err
        });
    }
});

router.get('/role', async (req,res) => {
    try {
        const result = await UserController.get_user_role_only(req.query.user_id);
        res.status(200).json({
            success: true,
            data: result,
            message: 'Success',
            error: undefined
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error getting the role of a user!',
            error: err
        });
    }
})


router.patch('/rolemapping', async (req,res) => {
    try {
        await UserController.update_role_mapping(req.body);
        res.status(200).json({
            success: true,
            data: null,
            message: 'Success',
            error: undefined
        });
    } catch(err) {
        console.log(err);
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error while updating the role!',
            error: err
        });
    }
})

router.post('/changepassword', async(req,res) => {
    try {
        const user = await UserController.find_user(req.body.userid);
        console.log(user);
        if (user.length > 0) {
            const valid = await UserController.validate_password(req.body.userid, req.body.current_password);
            if (valid) {
                await UserController.change_password(user[0].id_user_master, req.body.new_password);
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: 'Password Changed Successfully!',
                    error: undefined
                })
            } else {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'Current Password did not match!',
                    error: undefined
                });
            }
        }
    } catch(err) {
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error changing the password!',
            error: err
        });
    }
})

router.post('/resetpassword', async (req, res) => {
    try {
        await UserController.reset_password(req.body.id_user_master);
        res.status(200).json({
            success: true,
            data: null,
            message: 'Password Reset Successfully!',
            error: undefined
        })
    } catch(err) {
        res.status(400).json({
            success: false,
            data: null,
            message: 'Error resetting the password!',
            error: err
        });
    }
})

module.exports = router;

