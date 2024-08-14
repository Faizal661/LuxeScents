const Category = require("../models/categorySchema")
const { successResponse, errorResponse } = require('../helpers/responseHandler')

const CategoryAlreadyExists = "Category already exists"

const categoryInfo = async (req, res) => {
    try {
        let search = req.query.search || "";

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        let sort = req.query.sort || 'createdAt';
        let order = req.query.order === 'desc' ? -1 : 1;

        const categoryData = await Category.find({
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { description: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        })
            .sort({ [sort]: order })
            .skip(skip)
            .limit(limit);

        const totalCategories = await Category.countDocuments({
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { description: { $regex: ".*" + search + ".*", $options: "i" } }
            ]
        });

        const totalPages = Math.ceil(totalCategories / limit);

        res.render("category", {
            adminName: req.session.adminName,
            categoryData,
            currentPage: page,
            totalPages,
            totalCategories,
            limit,
            sort,
            order: req.query.order || 'asc'
        })
    } catch (error) {
        console.error(error, "Error while loading category page.");
        res.redirect("/pageerror")
    }
}

const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: CategoryAlreadyExists })
        }

        const newCategory = new Category({ name, description })
        await newCategory.save();

        res.json({ message: "Category added successfully" })
    } catch (error) {
        console.error(error, "Error while adding category.");
        res.status(500).json({ error: "Internal server error" })
    }
}

const getEditCategory = async (req, res) => {
    try {
        const categoryId = req.query.id
        const category = await Category.findOne({ _id: categoryId })
        res.render("edit-category", { category: category })
    } catch (error) {
        console.error(error, "Error while loading edit Category page.");
        res.redirect("/pagerror")
    }
}

const EditCategory = async (req, res) => {
    try {
        const categoryId = req.params.id
        const { categoryName, description } = req.body

        const existingCategory = await Category.findOne({ name: categoryName })
        if (existingCategory && existingCategory._id.toString() !== categoryId) {
            return res.status(400).json({ error: CategoryAlreadyExists })
        }

        const updateCategory = await Category.findByIdAndUpdate(categoryId, {
            name: categoryName,
            description: description
        }, { new: true })

        if (updateCategory) {
            res.json({ message: "Category updated successfully" })
        } else {
            res.status(404).json({ error: "Category not found" })
        }
    } catch (error) {
        console.error(error, "Error while updating category.");
        return res.status(500).json({ error: "Internal server error" })
    }
}


const toggleCategoryListing = async (req, res) => {
    try {
        const categoryId = req.query.id;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.redirect("/pageerror");
        }
        const newIsListedValue = !category.isListed;
        await Category.updateOne({ _id: categoryId }, { $set: { isListed: newIsListedValue } });
        res.redirect("/admin/category");
    } catch (error) {
        console.error(error, "Error while isListed of category.");
        res.redirect("/pageerror");
    }
};


module.exports = {
    categoryInfo,
    addCategory,
    getEditCategory,
    EditCategory,
    toggleCategoryListing,
}