#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate hitomi_fast
cd "$(dirname "$0")" || exit
cd hitomi_fast || exit
scrapy crawl hitomi_fast -a start="$1" -a stop="$2"
