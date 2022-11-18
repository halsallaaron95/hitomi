#!/bin/bash
cd "$(dirname "$0")" || exit 1
wget -q "https://ltn.hitomi.la/common.js" -O "common.js.new" || exit 1
wget -q "https://ltn.hitomi.la/gg.js" -O "gg.js.new" || exit 1
wget -q "https://ltn.hitomi.la/reader.js" -O "reader.js.new" || exit 1
mv -f "common.js.new" "common.js" || exit 1
mv -f "gg.js.new" "gg.js" || exit 1
mv -f "reader.js.new" "reader.js" || exit 1
