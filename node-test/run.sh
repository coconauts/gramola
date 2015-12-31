#!/bin/bash
node utils.js
node db.js
node collection.js
node collection-insertmultipleSync.js
node collection-insertmultiple.js
node buckets.js
node stats.js
node stats-inc.js
node stats-populate.js
node stats-speed.js
node link.js

echo "Removing old db from /tmp"
rm /tmp/14*.db
