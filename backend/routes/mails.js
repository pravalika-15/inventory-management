const nodemailer = require("nodemailer");
const Product = require("../Schema/productModel");
const Supplier = require("../Schema/supplierModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "stockcentral.app@gmail.com",
    pass: "nrbvttfzcgpyovyp",
  },
});

const getSupplierEmails = async (items) => {
  try {
    console.log(items);
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const supplierIds = products.map((product) => product.supplier);
    const suppliers = await Supplier.find({ _id: { $in: supplierIds } });
    return suppliers.map((supplier) => supplier.email);
  } catch (error) {
    console.error("Error fetching supplier emails:", error);
    throw new Error("Failed to fetch supplier emails");
  }
};
const sendCustomizedEmailToAdmin = async (status, orderId, updatedOrder) => {
  try {
    let recipients = [];

    let emailSubject = "";
    let emailContent = "";

    // Determine the email subject and content based on the order status
    if (status === "delivered") {
      emailSubject = `Order Delivered: Order #${orderId}`;
      emailContent = `The order with Order ID ${orderId} has been delivered successfully.`;
    } else if (status === "Refund initiated") {
      emailSubject = `Refund Initiated: Order #${orderId}`;
      emailContent = `The refund process has been initiated for the order with Order ID ${orderId}. The amount will be refunded to the original payment method. If you have any questions, please contact our support team.`;
    } else {
      emailSubject = `Order Status Updated: Order #${orderId}`;
      emailContent = `The status of the order with Order ID ${orderId} has been updated to "${status}".`;
    }

    recipients.push("pravalikaattada15@gmail.com");

    // Call the sendCustomizedEmail function to send the email to the admin
    await sendCustomizedEmail(recipients, emailSubject, emailContent);

    console.log("Customized email sent to user successfully");
  } catch (error) {
    console.error("Error sending email to admin:", error);
  }
};

// Function to send a customized email to recipients
const sendCustomizedEmail = async (recipients, subject, content) => {
  try {
    // Define the email options with the recipients, subject, and content
    const mailOptions = {
      from: "stockcentral.app@gmail.com", // Replace with your email
      to: recipients.join(", "), // Convert the array of recipients to a comma-separated string
      subject,
      text: content,
    };
    console.log("Sending email");
    // Send the email using the transporter object
    await transporter.sendMail(mailOptions);
    // console.log("Customized email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Function to send a customized email to suppliers
const sendCustomizedEmailToSuppliers = async (
  status,
  orderId,
  updatedOrder
) => {
  try {
    let recipients = [];

    let emailSubject = "";
    let emailContent = "";

    // Determine the email subject and content based on the order status
    if (status === "delivered") {
      emailSubject = `Order Delivered to the customer: Order #${orderId}`;
      emailContent = `The order with Order ID ${orderId} has been delivered to the customer successfully.`;
    } else if (status === "Refund initiated") {
      emailSubject = `Refund Initiated: Order #${orderId}`;
      emailContent = `The refund process has been initiated for the order with Order ID ${orderId}. The amount will be refunded to the customer's original payment method. If you have any questions, please contact our support team.`;
    } else {
      emailSubject = `Order Status Updated: Order #${orderId}`;
      emailContent = `The status of the order with Order ID ${orderId} has been updated to "${status}".`;
    }

    // Add supplier emails (based on items in the order)
    const supplierEmails = await getSupplierEmails(updatedOrder.items);
    recipients = recipients.concat(supplierEmails);

    // Call the sendCustomizedEmail function to send the email to the admin
    await sendCustomizedEmail(recipients, emailSubject, emailContent);

    console.log("Customized email sent to supplier successfully");
  } catch (error) {
    console.error("Error sending email to admin:", error);
  }
};

// Export the function to be used in other parts of your code
module.exports = {
  sendCustomizedEmailToAdmin,
  sendCustomizedEmail,
  sendCustomizedEmailToSuppliers,
};
