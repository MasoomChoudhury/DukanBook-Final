#!/bin/bash

# This script is intended to be run from the PROJECT ROOT folder.
# (the folder that contains 'App.tsx', 'components', 'services', etc.)

echo "Running in $(pwd)"
echo "Step 1: Creating 'divide' folder and person sub-directories..."

# Create the main 'divide' folder
mkdir -p "divide"

# Create person directories INSIDE 'divide'
mkdir -p "divide/person 1"
mkdir -p "divide/person 2"
mkdir -p "divide/person 3"
mkdir -p "divide/person 4"
mkdir -p "divide/person 5"
mkdir -p "divide/person 6"

echo "Step 2: Moving files from project root to 'divide' sub-directories..."

# --- Person 1 ---
echo "Moving files for Person 1..."
# Create the necessary structure inside the 'divide/person 1' folder
mkdir -p "divide/person 1/components/common"
mkdir -p "divide/person 1/services"
mkdir -p "divide/person 1/context"
mkdir -p "divide/person 1/components"

# Move files from project root to the new structure
mv components/common/Button.tsx "divide/person 1/components/common/"
mv components/common/Modal.tsx "divide/person 1/components/common/"
mv services/authService.ts "divide/person 1/services/"
mv context/AuthContext.tsx "divide/person 1/context/"
mv components/AuthModal.tsx "divide/person 1/components/"
mv components/LandingPage.tsx "divide/person 1/components/"

# --- Person 2 ---
echo "Moving files for Person 2..."
mkdir -p "divide/person 2/context"
mkdir -p "divide/person 2/components"

mv context/DataContext.tsx "divide/person 2/context/"
mv components/Sidebar.tsx "divide/person 2/components/"
mv components/HomePage.tsx "divide/person 2/components/"
mv App.tsx "divide/person 2/"

# --- Person 3 ---
echo "Moving files for Person 3..."
mkdir -p "divide/person 3/components"

mv components/ClientList.tsx "divide/person 3/components/"
mv components/ProductList.tsx "divide/person 3/components/"

# --- Person 4 ---
echo "Moving files for Person 4..."
mkdir -p "divide/person 4/services"
mkdir -p "divide/person 4/utils"
mkdir -p "divide/person 4/components"

mv services/geminiService.ts "divide/person 4/services/"
mv utils/gstCalculator.ts "divide/person 4/utils/"
mv utils/noto-sans-font.ts "divide/person 4/utils/"
mv utils/pdfGenerator.ts "divide/person 4/utils/"
mv index.d.ts "divide/person 4/"
mv components/InvoiceForm.tsx "divide/person 4/components/"
mv components/InvoiceList.tsx "divide/person 4/components/"

# --- Person 5 ---
echo "Moving files for Person 5..."
mkdir -p "divide/person 5/components"

mv components/PaymentForm.tsx "divide/person 5/components/"
mv components/PaymentList.tsx "divide/person 5/components/"
mv components/ExpenseList.tsx "divide/person 5/components/"

# --- Person 6 ---
echo "Moving files for Person 6..."
mkdir -p "divide/person 6/components"

mv components/Dashboard.tsx "divide/person 6/components/"
mv components/Reports.tsx "divide/person 6/components/"
mv components/InventoryScanner.tsx "divide/person 6/components/"

echo "All files moved successfully into the 'divide' folder."