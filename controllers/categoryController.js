const Category = require("../models/categorySchema")


const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const categoryData = await Category.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);
        res.render("category", {
            adminName: req.session.adminName,
            cat: categoryData,
            currentPage: page,
            totalPages: totalPages,
            totalCategories: totalCategories,
            limit: limit,

        })
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")
    }
}

const addCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exist" })
        }

        const newCategory = new Category({
            name,
            description
        })

        await newCategory.save();
        return res.json({ message: "Category added successfully" })

    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })

    }
}

const getEditCategory = async (req, res) => {
    try {
        const id = req.query.id
        const category = await Category.findOne({ _id: id })
        res.render("edit-category", { category: category })
    } catch (error) {
        console.error(error);
        res.redirect("/pagerror")
    }
}

const EditCategory = async (req, res) => {
    try {
        const id = req.params.id
        const { categoryName, description } = req.body

        const existingCategory = await Category.findOne({ name: categoryName })
        if (existingCategory && existingCategory._id.toString() !== id) {
            return res.status(400).json({error: "Category already exists, please choose another name"})
            // .render('edit-category', {
            //     category: { _id: id, name: categoryName, description },
            //     error: "Category already exists, please choose another name",
            // });

        }

        const updateCategory = await Category.findByIdAndUpdate(id, {
            name: categoryName,
            description: description
        }, { new: true })

        if (updateCategory) {
            res.json({message:"Category updated successfully"})
        } else {
            res.status(404).json({ error: "Category not found"})
            // .render('edit-category', {
            //     category: { _id: id, name: categoryName, description },
            //     error: "Category not found",
            //   });
        }

    } catch (error) {
        return res.status(500).json({ error: "Internal server error" })

    }
}


const unlistCategory = async (req, res) => {
    try {
        const id = req.query.id
        await Category.updateOne({ _id: id }, { $set: { isListed: false } })
        res.redirect("/admin/category")
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")

    }
}


const listCategory = async (req, res) => {
    try {
        const id = req.query.id
        await Category.updateOne({ _id: id }, { $set: { isListed: true } })
        res.redirect("/admin/category")
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror")

    }
}



module.exports = {
    categoryInfo,
    addCategory,
    getEditCategory,
    EditCategory,
    unlistCategory,
    listCategory
}