#!/bin/bash

# Setup script for PDF report generation dependencies
# This script installs the required Python packages for generating PDF reports

echo "🔧 Setting up PDF report generation dependencies..."

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed. Please install Python 3.7+ first."
    echo "   Visit: https://www.python.org/downloads/"
    exit 1
fi

# Determine Python command
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "🐍 Using Python command: $PYTHON_CMD"
echo "📋 Python version: $($PYTHON_CMD --version)"

# Check if pip is available
if ! $PYTHON_CMD -m pip --version &> /dev/null; then
    echo "❌ Error: pip is not available. Please install pip first."
    exit 1
fi

echo "📦 Installing required Python packages..."

# Install required packages (removed psycopg2 since we use API instead)
PACKAGES=(
    "reportlab>=3.6.0"
    "requests>=2.25.0"
)

# Try different installation methods to handle externally-managed-environment
echo "   Attempting to install packages..."

# Method 1: Try regular pip install first
if $PYTHON_CMD -m pip install "${PACKAGES[@]}" 2>/dev/null; then
    echo "   ✅ Packages installed successfully with pip"
elif $PYTHON_CMD -m pip install --user "${PACKAGES[@]}" 2>/dev/null; then
    echo "   ✅ Packages installed successfully with --user flag"
elif $PYTHON_CMD -m pip install --break-system-packages "${PACKAGES[@]}" 2>/dev/null; then
    echo "   ✅ Packages installed successfully with --break-system-packages"
    echo "   ⚠️  Note: Used --break-system-packages flag"
else
    echo "   ⚠️  Standard pip installation failed. Trying alternative methods..."
    
    # Method 2: Try with virtual environment
    VENV_DIR="venv-pdf"
    echo "   Creating virtual environment at $VENV_DIR..."
    
    if $PYTHON_CMD -m venv "$VENV_DIR" 2>/dev/null; then
        echo "   ✅ Virtual environment created"
        source "$VENV_DIR/bin/activate"
        
        if python -m pip install "${PACKAGES[@]}"; then
            echo "   ✅ Packages installed in virtual environment"
            echo "   📝 Note: Packages installed in virtual environment at $VENV_DIR"
            echo "   📝 To use: source $VENV_DIR/bin/activate"
        else
            echo "   ❌ Failed to install packages even in virtual environment"
            exit 1
        fi
    else
        echo "   ❌ Failed to create virtual environment"
        echo "   💡 Please install packages manually:"
        echo "      pip3 install --user reportlab requests"
        echo "   Or create a virtual environment:"
        echo "      python3 -m venv venv-pdf"
        echo "      source venv-pdf/bin/activate"
        echo "      pip install reportlab requests"
        exit 1
    fi
fi

echo ""
echo "🧪 Testing PDF generation dependencies..."

# Test imports
$PYTHON_CMD -c "
import sys
try:
    import reportlab
    print('✅ ReportLab imported successfully')
    print(f'   Version: {reportlab.Version}')
except ImportError as e:
    print(f'❌ ReportLab import failed: {e}')
    sys.exit(1)

try:
    import requests
    print('✅ Requests imported successfully')
    print(f'   Version: {requests.__version__}')
except ImportError as e:
    print(f'❌ Requests import failed: {e}')
    sys.exit(1)

print('')
print('🎉 All dependencies are working correctly!')
print('📝 Note: Using API-based database access (no direct PostgreSQL connection needed)')
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PDF report generation setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Ensure your environment variables are set:"
    echo "      - JUSPAY_USERNAME"
    echo "      - JUSPAY_PASSWORD"
    echo "      - DB_API_ENDPOINT (optional)"
    echo ""
    echo "   2. Run your tests with CRON_RUN_ID to generate PDF reports:"
    echo "      export CRON_RUN_ID=\$(date +\"%Y%m%d%H%M%S\")"
    echo "      ./run-staggered-tests-server.sh"
    echo ""
    echo "   3. PDF reports will be generated in the 'reports/' directory"
    echo ""
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi
