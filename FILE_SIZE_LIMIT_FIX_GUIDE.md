# 🔧 File Size Limit Fix Guide - DopeTech Nepal

## 🚨 **PROBLEM IDENTIFIED**

Your admin panel uploads are failing because of extremely restrictive file size limits set in Supabase Storage. Even tiny files (100 bytes) are being rejected with "The object exceeded the maximum allowed size".

## 🔍 **ROOT CAUSE**

You set file size limits to reduce egress costs, but they're now too restrictive for normal operation.

## 🛠️ **SOLUTION OPTIONS**

### **Option 1: Increase File Size Limits in Supabase Dashboard (RECOMMENDED)**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `flrcwmmdveylmcbjuwfc`

2. **Navigate to Storage Settings**
   - Go to: **Storage** → **Settings**
   - Look for **File size limits** section

3. **Update File Size Limits**
   - **assets bucket**: Increase to at least 5MB (5,242,880 bytes)
   - **qr-codes bucket**: Increase to at least 2MB (2,097,152 bytes)
   - **products bucket**: Increase to at least 5MB (5,242,880 bytes)
   - **hero-images bucket**: Increase to at least 10MB (10,485,760 bytes)

4. **Recommended Limits**
   ```
   assets: 5MB (for product images, logos)
   qr-codes: 2MB (for payment QR codes)
   products: 5MB (for product images)
   hero-images: 10MB (for hero banners)
   receipts: 5MB (for order receipts)
   ```

### **Option 2: Use the New File Upload Component**

I've created a new component that handles file size validation:

```tsx
import { FileUploadWithSizeCheck } from '@/components/file-upload-with-size-check'

// In your admin panel
<FileUploadWithSizeCheck
  onFileSelect={(file) => handleFileUpload(file)}
  maxSizeBytes={1024 * 1024} // 1MB limit
  acceptedTypes={['image/*']}
  bucketName="assets"
/>
```

### **Option 3: Temporary Workaround - Use External URLs**

Until you fix the size limits, you can:

1. **Upload images to external services** (like Imgur, Cloudinary)
2. **Use the URLs directly** in your admin panel
3. **Skip Supabase Storage** for now

## 📋 **STEP-BY-STEP FIX**

### **Step 1: Check Current Limits**

1. Go to Supabase Dashboard
2. Navigate to Storage → Settings
3. Note the current file size limits for each bucket

### **Step 2: Update Limits**

1. **For each bucket**, increase the file size limit:
   - Click on the bucket name
   - Find "File size limit" setting
   - Increase to recommended values above
   - Save changes

### **Step 3: Test Uploads**

1. Go to your admin panel: `http://localhost:3007/dopetechadmin`
2. Try uploading a small image (< 1MB)
3. Verify it works
4. Try uploading larger images

### **Step 4: Monitor Usage**

1. Check Storage usage in Supabase Dashboard
2. Monitor egress costs
3. Adjust limits if needed

## 🎯 **IMMEDIATE ACTION REQUIRED**

**You need to increase the file size limits in your Supabase Storage settings.**

The current limits are so restrictive that even basic functionality is broken.

## 📊 **COST IMPACT**

- **Small images (1-5MB)**: Minimal cost impact
- **Optimize images**: Use compressed formats (WebP, optimized JPEG)
- **Monitor usage**: Check Supabase billing dashboard regularly

## 🔧 **ADMIN PANEL STATUS**

- ✅ **Database operations**: Working
- ✅ **Authentication**: Working  
- ✅ **UI interface**: Working
- ❌ **File uploads**: Blocked by size limits
- ❌ **Image management**: Blocked by size limits
- ❌ **QR code uploads**: Blocked by size limits

## 🚀 **AFTER FIXING SIZE LIMITS**

Once you increase the file size limits:

1. **Admin panel will work fully**
2. **Product image uploads will work**
3. **QR code uploads will work**
4. **Asset management will work**
5. **All CRUD operations will be functional**

## 📞 **NEXT STEPS**

1. **Increase file size limits** in Supabase Dashboard
2. **Test the admin panel** at `http://localhost:3007/dopetechadmin`
3. **Try uploading images** and verify they work
4. **Let me know** if you need help with the Supabase settings

**The admin panel is ready to work - you just need to fix the file size limits!** 🎉
