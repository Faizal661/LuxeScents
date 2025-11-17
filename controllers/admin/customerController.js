import User from '../../models/userSchema.js'
import { successResponse, errorResponse } from '../../helpers/responseHandler.js'

export const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search
        }
        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page)
        }

        let sort = req.query.sort || 'createdAt';
        let order = req.query.order === 'desc' ? 1 : -1;
        const limit = 5
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*" } },
                { email: { $regex: ".*" + search + ".*" } }
            ]
        })
            .sort({ [sort]: order })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*" } },
                { email: { $regex: ".*" + search + ".*" } }
            ]
        }).countDocuments();

        res.render('customers', {
            adminName: req.session.adminName,
            userData: userData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit: limit,
            sort: req.query.sort || 'name',
            order: req.query.order || 'asc',
            searchTerm: search
        })

    } catch (error) {
        console.error(error);
        res.redirect("/admin/pageError")
    }
}

export const toggleCustomerBlocking = async (req, res) => {
    try {
        const customerId = req.params.id;

        const customer = await User.findById(customerId);
        if (!customer) {
            return errorResponse(res, null, "User not found", 404);
        }

        const newStatus = !customer.isBlocked;
        await User.updateOne({ _id: customerId }, { $set: { isBlocked: newStatus } });

        return successResponse(res, { isBlocked: newStatus }, "User status updated successfully", 200);

    } catch (error) {
        console.error(error, "Error while toggling customer blocking status.");
        return errorResponse(res, error, "Failed to update user status", 500);
    }
}

