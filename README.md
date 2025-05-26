# THE SONS - 90-Day Devotional Web App (v3)

**A spiritual growth and community engagement platform built for THE SONS movement.**  
This PWA web application is designed to host a 90-day Bible reading and meditation challenge, provide daily devotionals, enable user progress tracking, and create a space for faith-based interaction.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Admin Panel](#admin-panel)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

THE SONS Devotional App is a full-featured spiritual web app with:
- Daily devotionals formatted in Markdown
- Real-time reaction system
- User progress tracking for 90 days
- Responsive and installable PWA experience
- Firebase-powered backend and Admin panel

---

## Key Features

- **Devotional Posting & Management**
  - Markdown support with image/video uploads
  - Editable + Deletable devotions
  - Scheduled publishing
- **User Dashboard**
  - Personalized stats, progress tracking, calendar view
  - Devotional streak system
- **Reactions & Engagement**
  - “Amen”, “Blessed”, “Shared” buttons with real-time sync
- **Admin Panel**
  - View, edit, delete, or schedule devotions
  - Upload Verse of the Day
  - Monitor user data and progress
- **Notifications**
  - Toast alerts for new posts
  - Optional dot indicator on new content
- **Mobile-First & PWA**
  - Fully responsive design
  - Offline caching of devotionals
  - Installable as an app

---

## Tech Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Framer Motion
- React Markdown

**Backend:**
- Firebase Auth
- Firebase Firestore
- Firebase Storage
- Firebase Hosting

**PWA:**
- Vite + vite-plugin-pwa
- Service workers for offline sync

---

## Project Structure

```
/src
  /components       # Reusable UI components
  /pages            # Register, Devotions, Dashboard, Admin, etc.
  /hooks            # Custom React hooks
  /utils            # Helper functions and services
  /context          # Auth and global app context
  /styles           # Tailwind or custom styles
  /assets           # Icons, logos, and images

/firebase
  firebase-config.ts
  firestore.rules
```

---

## Installation

```bash
git clone https://github.com/your-org/the-sons-devotional-app.git
cd the-sons-devotional-app
npm install
npm run dev
```

---

Firebase Setup

1. Create a Firebase project


2. Enable:

Authentication (Email/Password, Google)

Cloud Firestore

Firebase Storage

Hosting (optional)



3. Replace firebase-config.ts with your credentials


4. Set Firestore rules appropriately for user and admin access




---

Admin Panel

Admin users can:

Manage devotionals (create/edit/delete)

Upload Verse of the Day

See all users & progress

Post in-app notices or alerts (planned v4)


> Admin role is assigned manually in Firestore.




---

Roadmap

✅ Version 1 (MVP)

Registration form

View devotionals

Join group link


✅ Version 2

Admin panel

Content scheduling

PWA support


✅ Version 3 (Current)

Devotional Markdown editor

Reaction system

Toast & notification system

Real-time progress tracking


⏳ Version 4 (Planned)

Commenting system

Daily motivational quotes

Leaderboard & badges

Prayer wall with requests/approvals

Audio devotions



---

Contributing

1. Fork the repository


2. Create your feature branch: git checkout -b feature/myFeature


3. Commit your changes: git commit -m "Add feature"


4. Push to the branch: git push origin feature/myFeature


5. Open a pull request




---

License

This project is for educational and community use by THE SONS.
Copyright © 2025.