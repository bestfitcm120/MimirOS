#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  AIOS — Stop Script
#  Usage:  ./stop.sh [--volumes] [--help]
#
#  --volumes   Also delete all data volumes (database, files, cache)
#  --help      Show help
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${CYAN}[AIOS]${NC} $*"; }
success() { echo -e "${GREEN}[AIOS]${NC} $*"; }
warn()    { echo -e "${YELLOW}[AIOS]${NC} $*"; }
die()     { echo -e "${RED}[AIOS]${NC} $*" >&2; exit 1; }

DELETE_VOLUMES=false
for arg in "$@"; do
  case $arg in
    --volumes|-v) DELETE_VOLUMES=true ;;
    --help|-h)
      echo ""
      echo -e "${BOLD}AIOS Stop Script${NC}"
      echo "  ./stop.sh             Stop all containers (keep data volumes)"
      echo "  ./stop.sh --volumes   Stop + delete ALL data (database, files, cache)"
      echo "  ./stop.sh --help      Show this help"
      echo ""
      exit 0
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  die "docker compose not found"
fi

echo ""
echo -e "${BOLD}${CYAN}  Stopping AIOS...${NC}"
echo ""

if $DELETE_VOLUMES; then
  warn "  --volumes flag set: this will DELETE the database, uploaded files, and caches."
  read -rp "  Type 'yes' to confirm: " confirm
  [ "$confirm" = "yes" ] || { log "Cancelled"; exit 0; }
  $COMPOSE_CMD down -v --remove-orphans
  success "  ✓ All containers and volumes removed"
else
  $COMPOSE_CMD down --remove-orphans
  success "  ✓ All containers stopped (data volumes preserved)"
  log "    To also delete data: ./stop.sh --volumes"
fi

echo ""
