
# DukanBook: AI-Powered Billing & Inventory for Indian SMEs

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img alt="Gemini" src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

<p align="center">
  Modern, intelligent, and user-friendly billing software designed to empower small and medium enterprises in India. DukanBook leverages the power of Google's Gemini AI to automate tedious tasks, provide actionable insights, and streamline business operations.
</p>

## 🎯 The Problem

Small and medium-sized businesses (SMEs) are the backbone of the Indian economy. However, many still rely on traditional, manual methods for bookkeeping and inventory management. This leads to several challenges:
*   **Time-Consuming:** Manual entry for invoices, expenses, and inventory is slow and tedious.
*   **Error-Prone:** Manual calculations often lead to inaccuracies in GST, totals, and stock counts.
*   **Lack of Insight:** Without digitized data, it's difficult to track sales trends, identify popular products, or forecast future needs.
*   **GST Complexity:** Staying compliant with GST regulations can be a major headache for small business owners.
*   **Inventory Blindness:** Inaccurate stock levels lead to lost sales (out-of-stock) or tied-up capital (overstock).

## ✨ Our Solution: DukanBook

DukanBook is a comprehensive digital ledger that tackles these challenges head-on. It's more than just a billing tool; it's an intelligent business assistant. By integrating **Google's powerful Gemini AI**, DukanBook transforms raw business data into a strategic asset, allowing owners to focus on what they do best: growing their business.

---

## 🚀 Core Features

### 1. 📊 Intuitive Dashboard
An at-a-glance overview of your business's financial health.
- **Key Metrics:** Instantly view Total Revenue, Outstanding Receivables, and Total Expenses.
- **Sales Overview:** An interactive chart visualizes sales and expenses over time, helping you spot trends.
- **Recent Activity:** A feed of your latest invoices for quick reference.

### 2. 🧾 Effortless Invoicing
Create and manage professional, GST-compliant invoices in seconds.
- **Smart Form:** Auto-fills product details, calculates taxes (CGST, SGST) correctly based on state, and suggests the next invoice number.
- **PDF Generation:** Generate clean, professional PDF invoices with a single click.
- **Status Tracking:** Invoices are automatically marked as `Paid`, `Unpaid`, `Partially Paid`, or `Overdue`.

### 3. 📦 Smart Inventory Management
A robust system for tracking products and their variants.
- **Product Variants:** Add products with multiple attributes like size, color, or weight, each with its own stock level and price.
- **Automatic Stock Deduction:** Inventory levels are automatically updated when an invoice is created, modified, or deleted, ensuring real-time accuracy.
- **Low Stock Alerts:** The UI highlights products with low inventory, preventing stockouts.

### 4. 🤖 AI-Powered Inventory Scanner (with Gemini Vision)
Digitize your supplier invoices instantly.
- **Scan & Go:** Use your device's camera or upload an image of a purchase invoice.
- **Intelligent Extraction:** Gemini Vision API analyzes the image and accurately extracts line items, including product name, quantity, and price.
- **Batch Updates:** Review the extracted items and add them to your inventory in a single click. New products are created, and existing ones are updated.

### 5. 🧠 AI Business Analyst (with Gemini Pro)
Get data-driven insights without needing a team of analysts.
- **Actionable Reports:** The AI analyzes your sales, inventory, and expense data to generate a comprehensive report.
- **Key Insights Include:**
  - **Restock Recommendations:** Identifies fast-moving products that are low in stock.
  - **Top-Selling Products:** Ranks products by revenue and units sold.
  - **Sales Forecast:** Predicts your sales for the upcoming month.
  - **Overall Summary:** A concise, actionable summary of your business's performance.

### 6. 💸 Comprehensive Financial Tracking
A complete picture of your cash flow.
- **Payment Recording:** Log payments against specific invoices or as standalone transactions. Invoice statuses update automatically.
- **Expense Management:** Record all your business expenses with categories like 'Inventory', 'Utilities', and 'Marketing'.

---

## 🛠️ Tech Stack & Architecture

This project is built on a modern, scalable, and robust technology stack.

| Category          | Technology                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Frontend**      | **React**, **TypeScript**, **Tailwind CSS**, **Recharts**                                                       |
| **Backend**       | **Firebase** (Firestore Database, Firebase Authentication)                                                    |
| **AI & ML**       | **Google Gemini API** (Gemini 2.5 Flash for Vision, Text Generation, and Business Analysis)                   |
| **PDF Generation**| **jsPDF**, **jsPDF-AutoTable**                                                                                    |
| **Deployment**    | Deployed and tested on **Vercel**                                                                     |

### Architecture
- **Component-Based UI:** Built with React for a modular and maintainable user interface.
- **State Management:** Utilizes React Context API for centralized and predictable state management (`DataContext`, `AuthContext`).
- **Serverless Backend:** Leverages Firebase's serverless architecture, ensuring high availability, scalability, and security without managing servers.
- **AI Integration:** A dedicated `geminiService` module encapsulates all interactions with the Gemini API, making the AI logic clean and separated from UI components.

---

## ⚙️ Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/DukanBook.git
    cd DukanBook
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - In your project, go to **Authentication** -> **Sign-in method** and enable `Email/Password` and `Google` providers.
    - Go to **Firestore Database** and create a new database in `test mode`.
    - Navigate to **Project Settings** -> **General**. Under "Your apps", click the web icon (`</>`) to create a new web app.
    - Copy the `firebaseConfig` object.
    - In the project, navigate to `src/firebaseConfig.ts` and replace the placeholder configuration with your own.

4.  **Set up Google Gemini API Key:**
    - Go to [Google AI Studio](https://aistudio.google.com/) and create an API key.
    - In the root of the project, create a new file named `.env`.
    - Add your API key to the `.env` file like this:
      ```
      API_KEY=YOUR_GEMINI_API_KEY_HERE
      ```
    *Note: In a real-world production app, this key would be handled on a secure backend, but it is accessed via `process.env` for this project as per the environment's setup.*

5.  **Run the application:**
    ```bash
    npm start
    ```
    The app should now be running on `http://localhost:3000`.

---

## 📂 Project Structure

The codebase is organized logically to promote separation of concerns and maintainability.

```
/src
├── components/       # UI Components (Pages, Forms, Common elements)
│   ├── common/       # Reusable components (Button, Modal)
│   ├── AuthModal.tsx
│   ├── Dashboard.tsx
│   └── ...
├── context/          # React Context for global state management
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── services/         # Modules for external API interactions
│   ├── authService.ts
│   ├── geminiService.ts
│   └── ...
├── types/            # TypeScript type definitions and interfaces
│   └── types.ts
├── utils/            # Utility functions
│   ├── gstCalculator.ts
│   └── pdfGenerator.ts
├── App.tsx           # Main application component
└── index.tsx         # Application entry point
```

---

## 👥 Authors

This project was developed as part of our 7th-semester curriculum by:

*   **[Masoom Kumar Choudhury]** 
*   **[Priyangsu Banerjee]**
*   **[Rajdeep Mandal]** 
*   **[Rahul Kumar Naik]**
*   **[Rudra Prabhat Pattanaik]** 
*   **[Aman Kumar Singh]**
   
We are proud to have built a practical, AI-driven solution that addresses real-world challenges for small businesses in India.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
