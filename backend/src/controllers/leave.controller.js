const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');

// staff applying for leaves

const applyLeave = async function (req, res) {
    
    try{
        // NOTE: only staff can apply for leave
        if(req.user.role !== 'staff'){
            return res.status(403).json({
                message: 'Only staff can apply for leave'
            });
        }

        const { leaveDate, reason } = req.body;

        if(!leaveDate || !reason){
            
            return res.status(400).json({
                message: 'Leave date and reason required'
            })

        }

        // leave must be applied at least 2 days in advance
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const requestedDate = new Date(leaveDate);
        requestedDate.setHours(0,0,0,0);

        const daysDiffence = Math.floor((requestedDate - today)/ (1000*60*60*24));

        if(daysDiffence < 2){
            
            return res.status(400).json({
                message: 'Leave must be applied at least 2 days in advance'
            });

        }

        // check if leave already exists for that day
        const existing = await LeaveRequest.findOne({

            staffId: req.user.id,
            leaveDate: requestedDate,
            status: {
                $in: ['pending', 'approved']
            }

        });

        if(existing){

            return res.status(400).json({
                message: 'Leave already applied for this date'
            })

        };

        // create leave request
        const leave = await LeaveRequest.create({

            staffId: req.user.id,
            hotelId: req.user.hotelId,
            leaveDate: requestedDate,
            reason,
            appliedAt: new Date()

        });

        // get staff name for notification
        const User = require('../models/User');
        const staff = await User.findById(req.user.id).select('name');

        // notify the admin
        const Notification = require('../models/Notification');

        await Notification.create({
            hotelId: req.user.hotelId,
            type: 'leave_request',
            recipientRole: 'admin',
            message: `${staff.name} has applied for leave on ${requestedDate.toDateString()}.`,
            details: { leaveId: leave._id }
        });

        return res.status(201).json({

            message: 'Leave applied successfully',
            leave

        });
    }

    catch(err){
        
        return res.status(500).json({
            message: err.message
        })

    }
};


// staff --> can view their own leave requests

const getMyLeaves = async function (req, res) {
    
    try{

        const leaves = await LeaveRequest.find({
            staffId: req.user.id
        }).sort({
            leaveDate: -1
        });


        res.json(leaves);

    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};


// Admin --> can view all pending leave requests for their hotel

const getPendingLeaves = async function (req, res) {
    
    try{

        // only admin can see the pending leaves
        if(req.user.role !== 'admin'){
            
            return res.status(403).json({
                message: 'Admin only'
            })

        }

        const leaves = await LeaveRequest.find({
            
            hotelId: req.user.hotelId,
            status: 'pending'

        })
        .populate('staffId', 'name email skillLevel')
        .sort({ leaveDate: -1 });

        res.json(leaves);

    }

    catch(err){

        res.status(500).json({
            message: err.message
        })

    }
};


// Admin --> approves/ rejects the leaves
const updateLeaveStatus = async function (req, res) {
    
    try{

        if(req.user.role !== 'admin'){
            return res.status(403).json({
                message: 'Admin only'
            })
        }

        const { status } = req.body;

        if(!['approved', 'rejected'].includes(status)){
            return res.status(400).json({
                message: 'Status must be approved or rejected'
            })
        }

        // find the leave by its id

        const leave = await LeaveRequest.findOne({
            _id: req.params.id,
            hotelId: req.user.hotelId
        });

        if(!leave){

            return res.status(404).json({
                message: 'Leave request not found'
            })

        }

        if(leave.status !== 'pending'){

            return res.status(400).json({
                message: 'Leave already processed'
            })

        }

        leave.status = status;
        await leave.save();

        // notify the staff

        await Notification.create({

            hotelId: req.user.hotelId,
            type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
            recipientRole: 'staff',
            recipientUserId: leave.staffId,
            message: `Your leave request for ${leave.leaveDate.toDateString()} has been ${status}.`,
            details: { leaveId: leave._id }
        });

        res.json({
            message: `Leave ${status} successfully`,
            leave
        })
    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = { applyLeave, getMyLeaves, getPendingLeaves, updateLeaveStatus };
