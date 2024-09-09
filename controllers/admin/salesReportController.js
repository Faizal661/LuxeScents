const Category = require("../../models/categorySchema")
const Product = require('../../models/productSchema')
const User = require('../../models/userSchema')
const Order = require('../../models/orderSchema');
const excel = require('exceljs');
const pdf = require('pdfkit'); // For PDF generation


const loadSalesReportPage = async (req, res) => {
    try {
        const salesCount = await Order.countDocuments();
        const overallOrderAmount = await Order.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$finalAmount" } } }
        ]);
        const overallDiscount = await Order.aggregate([
            { $group: { _id: null, totalDiscount: { $sum: "$discount" } } }
        ]);

        const totalAmount = overallOrderAmount.length > 0 ? overallOrderAmount[0].totalAmount : 0;
        const totalDiscount = overallDiscount.length > 0 ? overallDiscount[0].totalDiscount : 0;

        const salesReport = await Order.find({})
            .populate('userId', 'name email')
            .populate('orderedItems.product', 'productName category price')
            .lean(); // Using .lean() to get plain JS objects

        res.render('salesReport', {
            salesCount,
            totalAmount,
            totalDiscount,
            salesReport
        });
    } catch (error) {
        console.log("Error loading sales report:", error);
        res.status(500).send("Internal Server Error");
    }
};



const downloadSalesReportExcel = async (req, res) => {
    try {
        const salesReport = await Order.find({})
            .populate('userId', 'name email')
            .populate('orderedItems.product', 'productName category price')
            .lean();

        // Create Excel sheet
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add headers
        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 20 },
            { header: 'User Name', key: 'userName', width: 30 },
            { header: 'Products', key: 'Products', width: 50 },
            { header: 'Total Amount', key: 'finalAmount', width: 15 },
            { header: 'Discount', key: 'discount', width: 10 },
            { header: 'Coupon Applied', key: 'couponApplied', width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'Order Status', key: 'orderStatus', width: 15 }
        ];

        // Add data
        salesReport.forEach(order => {
            const productDetails = order.orderedItems.map(item => 
                `${item.product.productName} (${item.size}, Qty: ${item.quantity})`
              ).join(', '); 

            worksheet.addRow({
                orderId: order.orderId,
                userName: order.userId ? order.userId.name : 'Guest',
                Products:  productDetails,
                finalAmount: order.finalAmount,
                discount: order.discount,
                couponApplied: order.couponApplied ? 'Yes' : 'No',
                paymentMethod: order.paymentMethod,
                orderStatus: order.orderStatus
            });
        });

        // Send Excel file as response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (error) {
        console.log("Error generating Excel:", error);
        res.status(500).send("Internal Server Error");
    }
};


const downloadSalesReportPDF = async (req, res) => {
    try {
        const salesReport = await Order.find({})
            .populate('userId', 'name email')
            .populate('orderedItems.product', 'productName category price')
            .lean();

        // Create PDF document
        const doc = new pdf();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');

        doc.pipe(res);

        // Add title
        doc.fontSize(18).text('Sales Report', { align: 'center' });
        doc.moveDown();

        // Define column widths
        const columnWidths = {
            orderId: 70,
            userName: 50,
            products: 100,
            finalAmount: 60,
            discount: 60,
            couponApplied: 60,
            paymentMethod: 100,
            orderStatus: 100
        };

        // Add table headers
        doc.fontSize(10).text('Order ID', 50, doc.y, { width: columnWidths.orderId });
        doc.text('User Name', 50 + columnWidths.orderId, doc.y, { width: columnWidths.userName });
        doc.text('Products', 50 + columnWidths.orderId + columnWidths.userName, doc.y, { width: columnWidths.products });
        doc.text('Total Amount', 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products, doc.y, { width: columnWidths.finalAmount });
        doc.text('Discount', 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount, doc.y, { width: columnWidths.discount });
        doc.text('Coupon Applied', 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount + columnWidths.discount, doc.y, { width: columnWidths.couponApplied });
        doc.text('Payment Method', 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount + columnWidths.discount + columnWidths.couponApplied, doc.y, { width: columnWidths.paymentMethod });
        doc.text('Order Status', 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount + columnWidths.discount + columnWidths.couponApplied + columnWidths.paymentMethod, doc.y, { width: columnWidths.orderStatus });
        doc.moveDown();

        // Add data rows
        salesReport.forEach(order => {
            const productDetails = order.orderedItems.map(item => 
                `${item.product.productName} (${item.size}, Qty: ${item.quantity})`
            ).join(',\n');

            doc.fontSize(9).text(order.orderId, 50, doc.y, { width: columnWidths.orderId });
            doc.text(order.userId ? order.userId.name : 'Guest', 50 + columnWidths.orderId, doc.y, { width: columnWidths.userName });
            doc.text(productDetails, 50 + columnWidths.orderId + columnWidths.userName, doc.y, { width: columnWidths.products });
            doc.text(`₹${order.finalAmount.toFixed(2)}`, 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products, doc.y, { width: columnWidths.finalAmount });
            doc.text(`₹${order.discount.toFixed(2)}`, 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount, doc.y, { width: columnWidths.discount });
            doc.text(order.couponApplied ? 'Yes' : 'No', 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount + columnWidths.discount, doc.y, { width: columnWidths.couponApplied });
            doc.text(order.paymentMethod, 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount + columnWidths.discount + columnWidths.couponApplied, doc.y, { width: columnWidths.paymentMethod });
            doc.text(order.orderStatus, 50 + columnWidths.orderId + columnWidths.userName + columnWidths.products + columnWidths.finalAmount + columnWidths.discount + columnWidths.couponApplied + columnWidths.paymentMethod, doc.y, { width: columnWidths.orderStatus });
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.log("Error generating PDF:", error);
        res.status(500).send("Internal Server Error");
    }
};


module.exports = {
    loadSalesReportPage,
    downloadSalesReportExcel,
    downloadSalesReportPDF

}



