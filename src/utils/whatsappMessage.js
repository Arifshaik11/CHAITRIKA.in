/**
 * Generate formatted WhatsApp message from order data
 */
export const generateWhatsAppMessage = (order, settings = {}) => {
  const {
    storeName = 'Chaitra',
    currencySymbol = '₹',
  } = settings;

  let message = `*NEW ORDER*\n`;
  message += `Order ID: #${order.orderNumber}\n\n`;

  // Customer Details
  message += `*CUSTOMER DETAILS*\n`;
  message += `Name: ${order.customerName}\n`;
  message += `Phone: ${order.customerPhone}\n`;
  if (order.customerEmail) {
    message += `Email: ${order.customerEmail}\n`;
  }
  message += `\n`;

  // Delivery Address
  message += `*DELIVERY ADDRESS*\n`;
  message += `${order.deliveryAddress}\n`;
  message += `${order.deliveryCity}, ${order.deliveryState} ${order.deliveryPincode}\n\n`;

  // Order Items
  message += `*ORDER ITEMS*\n`;
  order.orderItems.forEach((item, index) => {
    message += `${index + 1}. ${item.productName}\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ${currencySymbol}${item.unitPrice} each\n`;
    
    // Selected options/variants
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      Object.entries(item.selectedOptions).forEach(([key, value]) => {
        message += `   ${key}: ${value}\n`;
      });
    }
    
    message += `   Subtotal: ${currencySymbol}${item.subtotal}\n`;
    message += `\n`;
  });

  // Custom Images Info
  if (order.customImages && order.customImages.length > 0) {
    message += `*CUSTOM IMAGES*\n`;
    order.customImages.forEach((img, index) => {
      message += `${index + 1}. ${img.productName} - Image uploaded\n`;
    });
    message += `\n`;
  }

  // Order Summary
  message += `*ORDER SUMMARY*\n`;
  message += `Subtotal: ${currencySymbol}${order.subtotal}\n`;
  if (order.deliveryCharge > 0) {
    message += `Delivery: ${currencySymbol}${order.deliveryCharge}\n`;
  }
  if (order.tax > 0) {
    message += `Tax: ${currencySymbol}${order.tax}\n`;
  }
  message += `*Total: ${currencySymbol}${order.totalAmount}*\n\n`;

  // Customer Notes
  if (order.customerNotes) {
    message += `*CUSTOMER NOTES*\n`;
    message += `${order.customerNotes}\n\n`;
  }

  // Footer
  message += `---\n`;
  message += `${storeName} | Order Management\n`;
  message += `Thank you for your order!`;

  return message;
};

/**
 * Generate WhatsApp click-to-chat link
 */
export const generateWhatsAppLink = (phoneNumber, message) => {
  if (!phoneNumber) {
    console.error('WhatsApp phone number not provided');
    return null;
  }

  // Clean phone number (remove spaces, dashes, +)
  const cleanPhone = phoneNumber.replace(/[\s\-+]/g, '');

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // WhatsApp API link
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp with pre-filled message
 */
export const openWhatsApp = (phoneNumber, message) => {
  const link = generateWhatsAppLink(phoneNumber, message);
  if (link) {
    window.open(link, '_blank');
  }
};

/**
 * Format phone number to international format
 */
export const formatPhoneNumber = (phone) => {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // If doesn't start with 91 (India), add it
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    return '91' + cleaned;
  }
  
  return cleaned;
};

/**
 * Validate WhatsApp phone number
 */
export const validateWhatsAppPhone = (phone) => {
  const cleaned = formatPhoneNumber(phone);
  
  // Must be 10-15 digits
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false;
  }
  
  return true;
};

/**
 * Generate simple text order summary (for email, SMS, etc.)
 */
export const generateOrderSummaryText = (order, settings = {}) => {
  const { currencySymbol = '₹' } = settings;

  let summary = `ORDER #${order.orderNumber}\n\n`;
  
  summary += `Customer: ${order.customerName}\n`;
  summary += `Phone: ${order.customerPhone}\n`;
  summary += `Address: ${order.deliveryCity}, ${order.deliveryState}\n\n`;
  
  summary += `Items:\n`;
  order.orderItems.forEach((item) => {
    summary += `- ${item.productName} x${item.quantity}: ${currencySymbol}${item.subtotal}\n`;
  });
  
  summary += `\nTotal: ${currencySymbol}${order.totalAmount}\n`;
  
  if (order.customerNotes) {
    summary += `\nNotes: ${order.customerNotes}\n`;
  }
  
  return summary;
};
