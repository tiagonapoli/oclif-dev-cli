#! /bin/bash

set -euo pipefail

RED='\033[0;31m'

display_info() {
  printf "Usage ./createLink.sh [OPT]\nOptions are:\n"
  printf "  -h: Show this message\n"
  printf "  -r: Remove symlink\n"
  printf "  -c: Check for symlink\n"
  exit 0
}

while getopts "hrc" OPT; do
  case "$OPT" in
    "r") CREATE=false;;
    "c") check_for_symlink;;
    "h") display_info;;
    "?") display_info;;
  esac 
done

if ! [[ ":$PATH:" == *":$HOME/bin:"* ]]; then
  echo -e "${RED}Your PATH is missing '~/.oclif/bin/', you have to add it to be able to easily test the cli."
  exit 1
fi

OCLIF_BIN=$(node -e "const pkg=require('./package.json'); console.log(pkg.oclif.bin);")
OCLIF_BIN_TEST="$OCLIF_BIN-test"
BINARY_PATH=$PWD/bin/run 
LINK_PATH=/usr/local/bin/$OCLIF_BIN_TEST

if [ "$CREATE" == "true" ]; then
    ln -s $BINARY_PATH $LINK_PATH
else
    rm $LINK_PATH
fi