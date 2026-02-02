#!/bin/bash
# Notification sender for deployment status
# Usage: ./notify.sh "Deployment successful" "success"

MESSAGE="${1:-Status update}"
TYPE="${2:-info}"
WEBHOOK_URL="${NOTIFY_WEBHOOK:-}"

# Color codes for Discord/Slack
if [ "$TYPE" = "success" ]; then
    COLOR="3066993" # Green
elif [ "$TYPE" = "error" ]; then
    COLOR="15158332" # Red
else
    COLOR="3447003" # Blue
fi

# Send to webhook if configured
if [ -n "$WEBHOOK_URL" ]; then
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"embeds\": [{
                \"title\": \"Overdrafter Portal\",
                \"description\": \"$MESSAGE\",
                \"color\": $COLOR,
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }]
        }" > /dev/null 2>&1
    echo "✅ Notification sent"
else
    echo "ℹ️ No webhook configured (set NOTIFY_WEBHOOK)"
    echo "   Message: $MESSAGE"
fi