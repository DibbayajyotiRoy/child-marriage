# Child Marriage Management System

This is a web application built with React, Vite, and TypeScript, designed to manage and track child marriage-related data and cases. It leverages Shadcn UI for a modern and accessible user interface, Tailwind CSS for styling, and a robust API integration layer.

## Features

*   **User Authentication:** Secure login and protected routes for different user roles.
*   **Role-Based Dashboards:** Dedicated dashboards for Superadmin, Person, and other user types, providing tailored views and functionalities.
*   **Comprehensive API Integration:** Seamless interaction with backend services for managing:
    *   Admin operations
    *   Authentication
    *   Case management
    *   Department information
    *   Person data
    *   Post management
    *   Reporting
    *   Team formation
*   **Modern UI Components:** Utilizes Shadcn UI components for a consistent, accessible, and visually appealing user experience.
*   **Responsive Design:** Built with Tailwind CSS to ensure a responsive layout across various devices.
*   **State Management:** Efficient data fetching and caching with `@tanstack/react-query`.
*   **Form Handling:** Robust form validation and management using `react-hook-form` and `zod`.
*   **Theming:** Context-based theming for a customizable user interface.

## Technologies Used

*   **Frontend:**
    *   [React](https://react.dev/)
    *   [Vite](https://vitejs.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Shadcn UI](https://ui.shadcn.com/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [React Router DOM](https://reactrouter.com/en/main)
    *   [@tanstack/react-query](https://tanstack.com/query/latest)
    *   [React Hook Form](https://react-hook-form.com/)
    *   [Zod](https://zod.dev/)
    *   [Lucide React](https://lucide.dev/icons/) (Icons)
    *   [date-fns](https://date-fns.org/) (Date utilities)
    *   [Recharts](https://recharts.org/en-US/) (Charting library)
*   **Tooling:**
    *   [ESLint](https://eslint.org/)
    *   [Vite](https://vitejs.dev/)

## Project Structure

The project follows a clear and modular structure:

```
.
├── public/                 # Static assets
├── src/                # Source code
│   ├── api/                # API service definitions and endpoints
│   │   └── services/       # Individual service modules (admin, auth, case, etc.)
│   ├── components/         # Reusable UI components
│   │   ├── Auth/           # Authentication-related components
│   │   ├── Dashboards/     # Dashboard components for different roles
│   │   ├── Layout/         # Layout components
│   │   └── ui/             # Shadcn UI components (customized/extended)
│   ├── contexts/           # React Contexts for global state (e.g., Auth, Theme)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Main application pages
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point for the React application
│   └── index.css           # Global styles
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── vite.config.ts          # Vite build configuration
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm, yarn, or bun (npm is used in examples)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd child-marriage
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or bun install
    ```

### Running the Development Server

To start the development server:

```bash
npm run dev
# or yarn dev
# or bun dev
```

The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To build the application for production:

```bash
npm run build
# or yarn build
# or bun build
```

This will create a `dist` directory with the optimized production build.

### Linting

To run the linter:

```bash
npm run lint
# or yarn lint
# or bun lint
```

## Contributing

(Optional: Add guidelines for contributing if this is an open-source project)

## License

(Optional: Add license information)