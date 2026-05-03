const express = require('express');
const router = express.Router();

const { tokenVerificationMiddleware } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');


// any logged in user --> just require tokenVerification
router.get('/me', tokenVerificationMiddleware, function(req, res){

    res.json({
        message: 'Access granted',
        user: req.user
    });

});


// admin only --> role verification needed too

router.get('/admin', tokenVerificationMiddleware, allowRoles('admin'), function(req, res){

    res.json({
        message: 'Admin access granted'
    });

});


module.exports = router ;