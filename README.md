# Modern Issue Management Web Application – Frontend Documentation

Welcome to the frontend codebase for your modern, role-based issue management web application.

---

## Project Overview

This project delivers a full-featured, modern web application with **three distinct dashboards**, each tailored to specific roles within an organization.  
**Primary goal:** Manage, monitor, and resolve issues raised by external users—efficiently and in real time.

---

## 🔑 Key Dashboards & User Roles

### Superadmin Dashboard
- **Purpose:** Manage entire system settings.
- **Features:**
  - CRUD operations for:
    - Departments (e.g., Technical, Support, Field)
    - Members (Persons working in departments)
    - Police (special user group)
    - DICE (another specialized user group)
  - Administration roles and team hierarchy oversight.

### Person Dashboard (Department Members)
- **Purpose:** Enable department members to manage issues.
- **Features:**
  - Sidebar navigation:
    - Active Issues
    - Pending Issues
    - Resolved Issues
  - For each issue:
    - Open detailed view
    - Submit progress reports
    - Mark as resolved or escalate
  - Focus on clarity and task prioritization.

### Others Dashboard (Police, DICE, Admin Roles)
- **Purpose:** Real-time monitoring and advanced team management.
- **Features:**
  - Monitor all system issues in real time.
  - Form teams by grouping "Person" users from various departments.
  - Assign issues to teams for resolution.
  - Alerts for unnoticed or unassigned issues.
  - Actionable analytics and graphs on unresolved issues, team performance, etc.

---

## 🌟 Core Features

- **Role-based authentication and authorization**
- **Real-time notifications** for new, unassigned, or critical issues
- **Team management** and role assignment workflows
- **Issue tracking** with detailed status transitions
- **Reporting module** for submitting analyses and resolutions
- **Admin controls** for dynamic user and department management

---

## Technology Stack

- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Getting Started

You can edit and run the frontend code using any of the following methods:

### 1. Use Lovable

- Visit your [Lovable Project](https://lovable.dev/projects/9ec50553-58e8-4afe-b5f8-ce7e0da74530).
- Prompt for changes or use the visual editor.
- All changes are auto-committed to this repository.

### 2. Use Your Preferred IDE

To work locally:

Clone the repository
git clone <YOUR_GIT_URL>

Navigate to the project directory
cd <YOUR_PROJECT_NAME>

Install dependencies
npm i

Start the development server
npm run dev

text

**Requirements:**  
- Node.js & npm (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### 3. Edit Directly in GitHub

- Navigate to the desired file(s).
- Click the "Edit" (pencil) icon.
- Make your changes and commit.

### 4. Use GitHub Codespaces

- Go to the repository main page.
- Click "Code" > "Codespaces" tab > "New codespace".
- Edit and commit changes within Codespaces.

---

## Deployment

- Deploy directly from [Lovable](https://lovable.dev/projects/9ec50553-58e8-4afe-b5f8-ce7e0da74530):  
  Click **Share → Publish** for instant deployment.

---

## Custom Domain

- Connect a custom domain via Project > Settings > Domains > Connect Domain.
- See [Lovable docs](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide) for details.

---

## Contributing

We welcome contributions! Please open issues or submit pull requests for improvements, bug fixes, or new features.

---

## Support

For questions or support, please refer to the project’s main [Lovable page](https://lovable.dev/projects/9ec50553-58e8-4afe-b5f8-ce7e0da74530) or contact the maintainers.

---
