# Webhook Data Management Guide

## Overview
This guide explains how to view, manage, and export data collected from the Make.com webhook integration.

## Accessing Data Management

### Method 1: Dashboard Quick Access
1. Go to the **Dashboard** (`/`)
2. Click **"צפה בנתונים"** to see a quick overview
3. Click **"ניהול נתונים"** for full management

### Method 2: Sidebar Navigation
1. Open the sidebar (hamburger menu)
2. Click **"ניהול נתונים"** under the main menu

### Method 3: Direct URL
Navigate directly to: `http://localhost:5173/data-management`

## Data Management Features

### 📊 Statistics Dashboard
- **Total Products**: Number of products scraped
- **Total Avatars**: Number of avatars generated
- **Latest Data**: Date of most recent webhook response
- **Data Size**: Total size of stored data in KB

### 📦 Product Data
Each product contains:
- **Name**: Product name
- **Description**: Product description
- **Price**: Product price with currency
- **Category**: Product category
- **Brand**: Product brand
- **Features**: Array of product features
- **Image URL**: Product image link
- **Specifications**: Key-value pairs of specs
- **Created At**: Timestamp of when data was received

### 👥 Avatar Data
Each avatar contains:
- **Name**: Avatar name
- **Age**: Age range
- **Gender**: Gender (male/female/both)
- **Personality**: Personality description
- **Interests**: Array of interests
- **Background**: Avatar background story
- **Goals**: Avatar goals and aspirations
- **Pain Points**: Array of challenges/frustrations
- **Preferences**: Key-value pairs of preferences
- **Created At**: Timestamp of when data was received

## Actions Available

### 🔄 Refresh Data
- Click **"רענן"** to reload data from localStorage
- Useful if data was modified elsewhere

### 📥 Export Data
- Click **"ייצא נתונים"** to download all data as JSON
- File includes products, avatars, and metadata
- Filename format: `webhook-data-YYYY-MM-DD.json`

### 🗑️ Clear All Data
- Click **"מחק הכל"** to remove all stored data
- **Warning**: This action cannot be undone
- Confirmation dialog will appear

### 👁️ View Details
- Click on any product or avatar card to view full details
- Modal will show all available information
- Click outside or "סגור" to close

## Data Flow

### 1. Product and Avatar WebHook Trigger
When user clicks "המשך לאווטאר" in InitialBriefing:
```
Button Click → Loading Animation Starts → Product and Avatar WebHook Sent → Response Received → Data Stored → Loading Stops
```

### 2. Creative Plan WebHook Trigger
When user clicks "המשך לתכנון" in AvatarStep:
```
Button Click → Loading Animation Starts → Creative Plan WebHook Sent → Response Received → Data Auto-filled → Loading Stops
```

### 2. Data Storage
- Data is automatically saved to browser's localStorage
- No server required - all data is local
- Data persists between browser sessions

### 3. Auto-fill Avatar Form
- When webhook returns avatar data, it auto-fills the AvatarStep form
- 500ms delay ensures proper timing
- User can still edit the pre-filled data

## Troubleshooting

### No Data Showing
1. Check if webhook was triggered successfully
2. Open browser console (F12) and look for webhook logs
3. Verify localStorage has data: `localStorage.getItem('products')` and `localStorage.getItem('avatars')`

### Avatar Not Auto-filling
1. Check console for "🔄 Auto-filling avatar data" log
2. Verify webhook response contains avatar data
3. Check if AvatarStep component received webhookAvatarData prop

### Creative Plan Not Auto-filling
1. Check console for "🔄 Auto-filling creative plan from webhook data" log
2. Verify Creative Plan WebHook response contains creativePlan data
3. Check if PlanningCanvas component received webhookCreativePlanData prop

### Webhook Not Working
1. Verify Product and Avatar WebHook URL is correct: `https://hook.eu2.make.com/l7974g6exeqlkzlk0fak6y8tmfp4r5f9`
2. Verify Creative Plan WebHook URL is correct: `https://hook.eu2.make.com/1haskjrdx1u19ptruwe92324affn9j4m`
3. Check network tab for failed requests
4. Verify Make.com scenarios are active and responding

## Console Logging

The system includes comprehensive logging with emojis:
- 🚀 Webhook triggered
- 📤 Payload sent
- 📥 Response received
- ✅ Success
- ❌ Errors
- 💾 Data saved
- 🔄 Auto-filling data
- 🎯 Creative plan generation

## Data Structure Examples

### Product Response Example
```json
{
  "product": {
    "id": "prod_123",
    "name": "מוצר מדהים",
    "description": "תיאור המוצר...",
    "price": 99.99,
    "currency": "ILS",
    "imageUrl": "https://example.com/image.jpg",
    "category": "טכנולוגיה",
    "brand": "המותג",
    "features": ["תכונה 1", "תכונה 2"],
    "specifications": {"גודל": "M", "צבע": "כחול"},
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Avatar Response Example
```json
{
  "avatar": {
    "id": "avatar_123",
    "name": "דני הספורטאי",
    "age": "25-34",
    "gender": "male",
    "personality": "אנרגטי וספורטיבי",
    "interests": ["ספורט", "בריאות", "טכנולוגיה"],
    "background": "ספורטאי חובב",
    "goals": "לשמור על כושר ובריאות",
    "painPoints": ["אין זמן", "עלות גבוהה"],
    "preferences": {"סגנון": "מודרני"},
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Creative Plan WebHook Payload Example
```json
{
  "action": "generate_creative_plan",
  "product": {
    "name": "בקבוק מים חכם",
    "description": "בקבוק מים עם חיישן טמפרטורה",
    "features": ["חיישן טמפרטורה", "זיכרון יומי"],
    "price": 89.99,
    "offer": "ILS",
    "images": ["https://example.com/image.jpg"],
    "videos": []
  },
  "avatar": {
    "name": "דני הספורטאי",
    "age": ["25-34"],
    "gender": "male",
    "interests": "ספורט, בריאות",
    "painPoints": "אין זמן לאימונים",
    "objections": "זה יקר מדי",
    "dreamOutcome": "להיות בריא יותר",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Creative Plan Response Example
```json
{
  "success": true,
  "creativePlan": {
    "scenes": [
      {
        "scene_number": 1,
        "type": "video",
        "ai_prompt": "ספורטאי שותה מים אחרי אימון",
        "text_overlay": "הישאר לחוץ עם המים הטובים ביותר",
        "voiceover_text": "כשאתה מתאמן קשה, אתה צריך מים שיתמכו בך",
        "duration": 3
      }
    ],
    "total_duration": 14,
    "style": "modern_dynamic",
    "target_audience": "ספורטאים צעירים"
  }
}
```

## Best Practices

1. **Regular Exports**: Export data regularly to prevent loss
2. **Monitor Console**: Check console logs for debugging
3. **Test Webhook**: Use the data management page to verify webhook responses
4. **Backup Data**: Keep exported JSON files as backups
5. **Clear Old Data**: Periodically clear old data to maintain performance

## Support

If you encounter issues:
1. Check the console logs first
2. Verify webhook URL and Make.com scenario
3. Test with a simple product URL
4. Export data before clearing to preserve information 