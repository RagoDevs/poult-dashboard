# Poult Dashboard

A React TypeScript application for tracking finances and inventory of a chicken farm.

## Features

- **Transaction Tracking**: Record and monitor expenses and income
- **Categorization**: Organize transactions by categories (food, medicine, tools, fence, chicken purchases/sales)
- **Filtering**: Filter transactions by category
- **Chicken Inventory**: Track counts of hens, cocks, and chicks
- **Financial Summary**: View profit, income, and expense totals
- **Responsive Design**: Optimized for both mobile and desktop

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **UI Components**: Shadcn UI
- **Icons**: Lucide React

## Project Structure

- `src/components`: UI components (TransactionList, TransactionForm, etc.)
- `src/pages`: Main application pages
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd poult-dashboard

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
```

## Data Structure

Transactions include the following properties:
- `id`: Unique identifier
- `type`: 'expense' or 'income'
- `category`: Transaction category
- `amount`: Transaction amount
- `date`: Transaction date
- `description`: Additional details
- `quantity`: Number of chickens (for chicken transactions)
- `chickenType`: 'hen', 'cock', or 'chicks' (for chicken transactions)

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/52e875ef-75ee-4ca9-8123-70ac76d352e1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
