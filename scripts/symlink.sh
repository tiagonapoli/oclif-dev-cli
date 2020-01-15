#! /bin/bash

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[0;33m'

display_info() {
  printf "Usage ./createLink.sh [OPT]\nOptions are:\n"
  printf "  -h: Show this message\n"
  printf "  -r: Remove symlink\n"
  exit 0
}

CREATE=true
while getopts "hrc" OPT; do
  case "$OPT" in
    "r") CREATE=false;;
    "h") display_info;;
    "?") display_info;;
  esac 
done

GLOBAL_BIN_PATH_SUFFIX=".oclif/dev/bin"
GLOBAL_BIN_PATH="$HOME/$GLOBAL_BIN_PATH_SUFFIX"

if ! [[ ":$PATH:" == *":$GLOBAL_BIN_PATH:"* ]]; then
  echo -e "${RED}Your PATH is missing${RED} ${YELLOW}'\$HOME/$GLOBAL_BIN_PATH_SUFFIX'${YELLOW}${RED}, you have to add it to be able to easily test the cli.${RED}"
  exit 1
fi

OCLIF_BIN=$(node -e "const pkg=require('./package.json'); console.log(pkg.oclif.bin);")
OCLIF_BIN_TEST="$OCLIF_BIN-test"
BINARY_PATH=$PWD/bin/run 
LINK_PATH=$GLOBAL_BIN_PATH/$OCLIF_BIN_TEST

mkdir -p $GLOBAL_BIN_PATH

if [ "$CREATE" == "true" ]; then
    echo "Creating symlink: $LINK_PATH -> $BINARY_PATH"
    
    if [[ -f $LINK_PATH ]]; then
      rm $LINK_PATH
    fi
    
    ln -s $BINARY_PATH $LINK_PATH
    echo "You can now run the dev version of your cli running: '$OCLIF_BIN_TEST'"
else
    rm  $LINK_PATH
fi