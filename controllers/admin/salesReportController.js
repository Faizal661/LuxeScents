const Order = require('../../models/orderSchema');
const excel = require('exceljs');
const pdf = require('html-pdf');

const moment = require('moment');


const loadSalesReportPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        let filter = {};
        const filterType = req.query.filterType || 'yearly';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        switch (filterType) {
            case 'daily':
                filter.createdAt = {
                    $gte: moment().startOf('day').toDate(),
                    $lt: moment().endOf('day').toDate(),
                };
                break;
            case 'weekly':
                filter.createdAt = {
                    $gte: moment().startOf('week').toDate(),
                    $lt: moment().endOf('week').toDate(),
                };
                break;
            case 'yearly':
                filter.createdAt = {
                    $gte: moment().startOf('year').toDate(),
                    $lt: moment().endOf('year').toDate(),
                };
                break;
            case 'custom':
                if (startDate && endDate) {
                    filter.createdAt = {
                        $gte: startDate,
                        $lt: endDate,
                    };
                }
                break;
            default:
                break;
        }

        const overallOrderAmount = await Order.aggregate([
            { $match: filter }, { $group: { _id: null, totalAmount: { $sum: "$finalAmount" } } }
        ]);
        // const totalOrderAmount = overallOrderAmount.length > 0 ? overallOrderAmount[0].totalAmount : 0;

        const overallDiscount = await Order.aggregate([
            { $match: filter }, { $group: { _id: null, totalDiscount: { $sum: "$discount" } } }
        ]);

        const totalAmount = overallOrderAmount.length > 0 ? overallOrderAmount[0].totalAmount : 0;
        const totalDiscount = overallDiscount.length > 0 ? overallDiscount[0].totalDiscount : 0;

        const salesReport = await Order.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .populate('orderedItems.product', 'productName category price').sort({ createdAt: -1 })
            .lean();

        const salesCount = await Order.countDocuments(filter);
        const totalPages = Math.ceil(salesCount / limit);


        res.render('salesReport', {
            salesCount,
            totalAmount,
            totalDiscount,
            salesReport,
            currentPage: page,
            totalPages,
            limit,
            filterType,
            startDate,
            endDate
        });
    } catch (error) {
        console.log("Error loading sales report:", error);
        res.redirect("/pageError");

    }
};


const downloadSalesReportExcel = async (req, res) => {
    try {
        let filter = {};
        const filterType = req.query.filterType || 'yearly';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;


        switch (filterType) {
            case 'daily':
                filter.createdAt = {
                    $gte: moment().startOf('day').toDate(),
                    $lt: moment().endOf('day').toDate(),
                };
                break;
            case 'weekly':
                filter.createdAt = {
                    $gte: moment().startOf('week').toDate(),
                    $lt: moment().endOf('week').toDate(),
                };
                break;
            case 'yearly':
                filter.createdAt = {
                    $gte: moment().startOf('year').toDate(),
                    $lt: moment().endOf('year').toDate(),
                };
                break;
            case 'custom':
                if (startDate && endDate) {
                    filter.createdAt = {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate),
                    };
                }
                break;
            default:
                break;
        }

        const salesReport = await Order.find(filter)
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
                Products: productDetails,
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
            res.redirect("/pageError");

    }
};



const downloadSalesReportPDF = async (req, res) => {
    try {
        let filter = {};
        const filterType = req.query.filterType || 'yearly';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        // Filter logic based on filterType
        switch (filterType) {
            case 'daily':
                filter.createdAt = {
                    $gte: moment().startOf('day').toDate(),
                    $lt: moment().endOf('day').toDate(),
                };
                break;
            case 'weekly':
                filter.createdAt = {
                    $gte: moment().startOf('week').toDate(),
                    $lt: moment().endOf('week').toDate(),
                };
                break;
            case 'yearly':
                filter.createdAt = {
                    $gte: moment().startOf('year').toDate(),
                    $lt: moment().endOf('year').toDate(),
                };
                break;
            case 'custom':
                if (startDate && endDate) {
                    filter.createdAt = {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate),
                    };
                }
                break;
            default:
                break;
        }

        const salesReport = await Order.find(filter)
            .populate('userId', 'name email')
            .populate('orderedItems.product', 'productName category price')
            .lean();

        let html = `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    h2 {
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h2>Sales Report</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User Name</th>
                            <th>Products</th>
                            <th>Total Amount</th>
                            <th>Discount</th>
                            <th>Coupon Applied</th>
                            <th>Payment Method</th>
                            <th>Order Status</th>
                        </tr>
                    </thead>
                    <tbody>`;

        salesReport.forEach(order => {
            const productDetails = order.orderedItems.map(item => 
                `${item.product.productName} (${item.size}, Qty: ${item.quantity})`
            ).join(', ');

            html += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.userId ? order.userId.name : 'Guest'}</td>
                    <td>${productDetails}</td>
                    <td>₹${order.finalAmount.toFixed(2)}</td>
                    <td>₹${order.discount.toFixed(2)}</td>
                    <td>${order.couponApplied ? 'Yes' : 'No'}</td>
                    <td>${order.paymentMethod}</td>
                    <td>${order.orderStatus}</td>
                </tr>`;
        });

        html += `
                    </tbody>
                </table>
            </body>
        </html>`;

        // PDF options
        const options = {
            format: 'A4',
            orientation: 'portrait',
            border: {
                top: '1cm',
                right: '1cm',
                bottom: '1cm',
                left: '1cm'
            }
        };

        pdf.create(html, options).toStream((err, stream) => {
            if (err) {
                console.error("Error generating PDF:", err);
                return res.redirect("/pageError");
            }
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
            stream.pipe(res);
        });
    } catch (error) {
        console.log("Error generating PDF:", error);
        res.redirect("/pageError");
    }
};


module.exports = {
    loadSalesReportPage,
    downloadSalesReportExcel,
    downloadSalesReportPDF

}



