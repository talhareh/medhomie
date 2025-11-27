# Manual Database Migration Commands

## Option 1: MongoDB Shell Command

Run this command in your MongoDB shell or MongoDB Compass:

```javascript
// Update the specific lesson "Postnatal Care" with cloudflarePdfUrl
db.courses.updateOne(
  {
    "title": "MRCPI",
    "modules.title": "Ebooks and quizzes",
    "modules.lessons.title": "Postnatal Care"
  },
  {
    $push: {
      "modules.$[module].lessons.$[lesson].attachments": "https://pub-48fb0b5e74e641b39cbe01ff2a0d63c5.r2.dev/1754656872361-291283395.pdf"
    },
    $unset: {
      "modules.$[module].lessons.$[lesson].cloudflarePdfUrl": ""
    }
  },
  {
    arrayFilters: [
      { "module.title": "Ebooks and quizzes" },
      { "lesson.title": "Postnatal Care" }
    ]
  }
)
```

## Option 2: Simple Update for Your Specific Case

Since you know the exact lesson, you can run this simpler command:

```javascript
// Find and update the specific lesson
db.courses.updateOne(
  { "_id": ObjectId("68a1530a5084f4ecdd484d15") },
  {
    $set: {
      "modules.2.lessons.0.attachments": ["https://pub-48fb0b5e74e641b39cbe01ff2a0d63c5.r2.dev/1754656872361-291283395.pdf"]
    },
    $unset: {
      "modules.2.lessons.0.cloudflarePdfUrl": ""
    }
  }
)
```

## Option 3: Verify the Change

After running the update, verify it worked:

```javascript
// Check the updated lesson
db.courses.findOne(
  { "_id": ObjectId("68a1530a5084f4ecdd484d15") },
  { 
    "modules.title": 1,
    "modules.lessons.title": 1,
    "modules.lessons.attachments": 1,
    "modules.lessons.cloudflarePdfUrl": 1
  }
)
```

## Expected Result

After the migration, your lesson should look like this:

```javascript
{
  "title": "Postnatal Care",
  "attachments": ["https://pub-48fb0b5e74e641b39cbe01ff2a0d63c5.r2.dev/1754656872361-291283395.pdf"],
  // cloudflarePdfUrl field should be removed
}
```
