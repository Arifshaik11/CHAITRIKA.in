# Chaitra Wrap@Wear - E-commerce Website

A modern, responsive e-commerce website for customized photo frames and accessories. Built with React and featuring a complete product customization system with WhatsApp integration for order processing.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse magnetic photo frames, keychains, acrylic frames, and MDF frames
- **Multiple Sizes**: Different size options for each product category
- **Image Upload**: Upload and customize photos for personalization
- **Image Adjustments**: Brightness, contrast, and saturation controls
- **Shopping Cart**: Add, remove, and manage quantities
- **WhatsApp Checkout**: Direct order placement via WhatsApp with admin
- **Responsive Design**: Works perfectly on all devices

### Admin Features
- **Admin Login**: Secure admin access (Username: `admin`, Password: `admin123`)
- **Product Management**: Add, edit, and delete products
- **Price Management**: Set different prices for different sizes
- **Image Management**: Update product images via URLs
- **Real-time Updates**: Changes reflect immediately on the website

### Technical Features
- **Frontend Only**: No backend required - uses local storage
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Fast Performance**: Optimized React components
- **Easy Deployment**: Can be deployed on any static hosting service

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone or download the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd photo-frame-ecommerce

   # Or extract the downloaded files to a folder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - The website will open automatically at `http://localhost:3000`
   - If it doesn't open automatically, visit the URL manually

## 🔥 Firebase Cloud Storage Setup (Important!)

This app uses Firebase Cloud Storage for automatic product image uploads and real-time website updates.

### Quick Setup (5 minutes)

**For detailed setup, see: [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md)**

1. Create Firebase project at https://console.firebase.google.com/
2. Get your Firebase credentials from Project Settings
3. Copy credentials to `.env` file in project root
4. Enable Firestore Database (test mode)
5. Enable Firebase Storage (test mode)
6. Restart dev server: `npm start`

**That's it!** Now:
- Admin can upload product images from Admin Panel
- Images automatically store in Firebase Cloud Storage
- Product data saves to Firestore Database
- New products appear on website instantly
- Everything syncs in real-time

### Documentation

- **Quick Start**: [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md) - 5 minute setup
- **Full Guide**: [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Detailed instructions
- **Testing**: [FIREBASE_TESTING_GUIDE.md](./FIREBASE_TESTING_GUIDE.md) - Verify everything works

### Admin Panel Features

- **Add Products**: Fill form, upload image, set prices for sizes/shapes
- **Edit Products**: Modify existing products and re-upload images
- **Delete Products**: Remove products instantly
- **Real-time Sync**: Changes appear on website immediately without refresh

### Deployment Notes

When deploying (Vercel, Netlify, etc.):
1. Add all environment variables to your deployment platform
2. Add your deployed domain to Firebase Authentication → Authorized Domains
3. Test admin panel on deployed site

---

## 📋 Usage Guide

### For Customers

1. **Browse Products**
   - Visit the homepage to see featured products
   - Go to "Products" page to see the full catalog
   - Use filters to narrow down by category and price

2. **Customize Products**
   - Click on any product to open the customization page
   - Upload your photo using the drag-and-drop interface
   - Adjust image brightness, contrast, and saturation
   - Select your preferred size
   - Add to cart

3. **Place Order**
   - Review items in your cart
   - Proceed to checkout
   - Fill in your contact and delivery details
   - Complete order via WhatsApp

### For Administrators

1. **Admin Access**
   - Go to `/admin` or click the user icon in the header
   - Login with: Username: `admin`, Password: `admin123`

2. **Manage Products**
   - Add new products with multiple sizes and prices
   - Edit existing product details and pricing
   - Delete products that are no longer available
   - Update product images and descriptions

3. **WhatsApp Integration**
   - Update the admin WhatsApp number in `/src/pages/Checkout.js`
   - Change the `ADMIN_WHATSAPP` constant to your number
   - Format: `919876543210` (country code + number, no spaces or symbols)

## ⚙️ Configuration

### WhatsApp Integration Setup

To set up WhatsApp integration for order processing:

1. **Update Admin WhatsApp Number**
   ```javascript
   // In src/pages/Checkout.js, line 18
   const ADMIN_WHATSAPP = '919876543210'; // Replace with your WhatsApp number
   ```

2. **Number Format**
   - Use international format without '+' or spaces
   - Example: For +91 98765 43210, use: `919876543210`

### Admin Credentials

To change admin login credentials:

1. **Update Login Details**
   ```javascript
   // In src/context/AuthContext.js, lines 12-15
   const ADMIN_CREDENTIALS = {
     username: 'your-username',
     password: 'your-password'
   };
   ```

### Product Categories

The system supports these product categories:
- `magnetic` - Magnetic Photo Frames
- `keychain` - Custom Keychains  
- `acrylic` - Acrylic Photo Frames
- `mdf` - MDF Photo Frames

Add new categories by updating the category options in `AdminPanel.js`.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deployment Options

1. **Netlify** (Recommended)
   - Drag and drop the `build` folder to Netlify
   - Or connect your git repository for automatic deployments

2. **Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel --prod`

3. **GitHub Pages**
   - Push the `build` folder contents to `gh-pages` branch
   - Enable GitHub Pages in repository settings

4. **Any Static Hosting**
   - Upload the `build` folder contents to your web server

## 📱 Features Overview

### Product Customization
- **Image Upload**: Supports JPG, PNG, GIF (up to 10MB)
- **Live Preview**: See how your photo will look on the product
- **Image Adjustments**: Fine-tune brightness, contrast, and saturation
- **Multiple Sizes**: Choose from various size options with different pricing

### Shopping Experience
- **Intuitive Cart**: Easy add/remove with quantity controls
- **Price Calculation**: Automatic total calculation with free shipping
- **Order Summary**: Detailed breakdown before checkout
- **WhatsApp Integration**: Seamless order completion

### Admin Management
- **Product CRUD**: Complete product management system
- **Price Control**: Set different prices for different sizes
- **Image Management**: Update product visuals easily
- **Persistent Storage**: All data saved locally in browser

## 🛠️ Technical Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **Storage**: Browser Local Storage
- **Build Tool**: Create React App

## 📞 Support

### Common Issues

1. **WhatsApp not opening**: Check if WhatsApp number format is correct
2. **Images not uploading**: Ensure image is under 10MB and in JPG/PNG/GIF format
3. **Admin login issues**: Verify credentials in AuthContext.js
4. **Products not saving**: Check if browser allows local storage

### Customization Support

The codebase is well-structured and commented for easy customization:
- **Styling**: Modify Tailwind classes throughout components
- **Features**: Add new functionality in respective component files
- **Products**: Extend product schema in ProductContext.js
- **Order Flow**: Customize checkout process in Checkout.js

## 📄 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute as needed.

---

Built with ❤️ for small businesses looking to sell customized photo products online.