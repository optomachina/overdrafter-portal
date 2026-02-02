#!/bin/bash
# Continuous testing - runs tests every 5 minutes during dev

while true; do
    clear
    echo "🔄 Auto-test cycle: $(date)"
    
    npm run test:unit:run
    
    if [ $? -eq 0 ]; then
        echo "✅ All tests passing"
    else
        echo "❌ Tests failed - check output above"
        # Could add notification here
    fi
    
    echo "Next check in 5 minutes..."
    sleep 300
done