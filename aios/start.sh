#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#  AIOS — Master Startup Script
#  Usage:  ./start.sh [--build] [--clean] [--dev] [--logs] [--help]
#
#  --build   Force rebuild of all Docker images (use after code changes)
#  --clean   Wipe all volumes and start fresh (WARNING: deletes all data)
#  --dev     Start in dev mode (hot reload, ports exposed for debugging)
#  --logs    Tail logs after startup instead of showing status
#  --help    Show this help
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # no colour

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${BLUE}[AIOS]${NC} $*"; }
success() { echo -e "${GREEN}[AIOS]${NC} $*"; }
warn()    { echo -e "${YELLOW}[AIOS]${NC} $*"; }
error()   { echo -e "${RED}[AIOS]${NC} $*" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}──────────────────────────────────────────${NC}"; \
            echo -e "${BOLD}${CYAN} $*${NC}"; \
            echo -e "${BOLD}${CYAN}──────────────────────────────────────────${NC}"; }
die()     { error "$*"; exit 1; }

# ── Parse arguments ───────────────────────────────────────────────────────────
FORCE_BUILD=false
CLEAN_START=false
DEV_MODE=false
TAIL_LOGS=false

for arg in "$@"; do
  case $arg in
    --build)  FORCE_BUILD=true ;;
    --clean)  CLEAN_START=true ;;
    --dev)    DEV_MODE=true ;;
    --logs)   TAIL_LOGS=true ;;
    --help|-h)
      echo ""
      echo -e "${BOLD}AIOS Startup Script${NC}"
      echo ""
      echo "  ./start.sh              Start all services (build only if needed)"
      echo "  ./start.sh --build      Force rebuild all Docker images"
      echo "  ./start.sh --clean      Wipe volumes + full rebuild (fresh start)"
      echo "  ./start.sh --dev        Expose debug ports (postgres, redis, backend)"
      echo "  ./start.sh --logs       Tail all logs after startup"
      echo "  ./start.sh --help       Show this help"
      echo ""
      exit 0
      ;;
    *) warn "Unknown argument: $arg (try --help)" ;;
  esac
done

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║        AIOS — AI Operating System     ║"
echo "  ║           Startup Script v1.0         ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ── Script must run from the aios root directory ──────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
log "Working directory: $SCRIPT_DIR"

# ── Step 1: Check prerequisites ───────────────────────────────────────────────
step "Checking prerequisites"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    success "  ✓ $1 found ($(command -v "$1"))"
  else
    die "  ✗ $1 not found. Install it first.\n    Hint: $2"
  fi
}

check_cmd docker     "https://docs.docker.com/engine/install/"
check_cmd curl       "sudo apt install curl"

# Check Docker daemon is running
if ! docker info &>/dev/null; then
  die "Docker daemon is not running. Start it with: sudo systemctl start docker"
fi
success "  ✓ Docker daemon is running"

# Check docker compose (v2 plugin)
if docker compose version &>/dev/null; then
  COMPOSE_CMD="docker compose"
  success "  ✓ docker compose v2 found"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
  warn "  ⚠ Using legacy docker-compose. Consider upgrading to Docker Compose v2."
else
  die "  ✗ docker compose not found.\n    Install: sudo apt install docker-compose-plugin"
fi

# ── Step 2: Environment file ──────────────────────────────────────────────────
step "Checking environment configuration"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    warn "  Created .env from .env.example"
    warn "  ┌─────────────────────────────────────────────────────────────┐"
    warn "  │  ACTION REQUIRED: Add your OpenRouter API key to .env       │"
    warn "  │  Get a free key at: https://openrouter.ai/keys              │"
    warn "  │  Edit: nano .env  →  set OPENROUTER_API_KEY=sk-or-v1-...   │"
    warn "  └─────────────────────────────────────────────────────────────┘"
    echo ""
    read -rp "  Press Enter to continue without an API key (or Ctrl+C to edit .env first)..."
  else
    die ".env.example not found. Are you in the AIOS root directory?"
  fi
else
  success "  ✓ .env file found"
fi

# Check if OpenRouter key is set
OPENROUTER_KEY=$(grep "^OPENROUTER_API_KEY=" .env | cut -d= -f2 | tr -d ' ' || true)
if [ -z "$OPENROUTER_KEY" ] || [ "$OPENROUTER_KEY" = "sk-or-v1-your-key-here" ]; then
  warn "  ⚠ OPENROUTER_API_KEY not set — AI features will be disabled"
  warn "    Get a free key at https://openrouter.ai/keys and add it to .env"
else
  success "  ✓ OPENROUTER_API_KEY is set"
fi

# ── Step 3: Clean (if requested) ──────────────────────────────────────────────
if $CLEAN_START; then
  step "Clean start — wiping all data volumes"
  warn "  This will DELETE all stored data, files, and the database."
  read -rp "  Type 'yes' to confirm: " confirm
  if [ "$confirm" = "yes" ]; then
    $COMPOSE_CMD down -v --remove-orphans 2>/dev/null || true
    success "  ✓ Volumes wiped"
  else
    warn "  Clean start cancelled"
  fi
fi

# ── Step 4: Choose compose file ───────────────────────────────────────────────
COMPOSE_FILE="docker-compose.yml"
if $DEV_MODE && [ -f "docker-compose.dev.yml" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
  log "  Using dev compose file: $COMPOSE_FILE"
fi

# ── Step 5: Build images ──────────────────────────────────────────────────────
step "Building Docker images"

BUILD_ARGS=""
if $FORCE_BUILD || $CLEAN_START; then
  BUILD_ARGS="--build --force-recreate"
  log "  Force rebuild requested"
else
  BUILD_ARGS="--build"
  log "  Building (uses cache where possible)"
fi

log "  This may take 3–5 minutes on first run (downloading base images + model)..."
$COMPOSE_CMD -f "$COMPOSE_FILE" build \
  --parallel \
  2>&1 | while IFS= read -r line; do
    echo -e "  ${DIM}$line${NC}"
  done

success "  ✓ Images built"

# ── Step 6: Start all services ────────────────────────────────────────────────
step "Starting all services"

$COMPOSE_CMD -f "$COMPOSE_FILE" up -d $BUILD_ARGS 2>/dev/null || \
$COMPOSE_CMD -f "$COMPOSE_FILE" up -d

success "  ✓ Containers started"

# ── Step 7: Wait for health checks ───────────────────────────────────────────
step "Waiting for services to become healthy"

wait_healthy() {
  local name="$1"
  local max_wait="${2:-90}"
  local elapsed=0
  local interval=3

  printf "  Waiting for %-20s " "$name..."
  while true; do
    status=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "missing")
    case "$status" in
      healthy)
        echo -e "${GREEN}✓ healthy${NC} (${elapsed}s)"
        return 0
        ;;
      unhealthy)
        echo -e "${RED}✗ unhealthy${NC}"
        echo ""
        error "  Container $name failed health check."
        error "  Check logs with: docker logs $name --tail 50"
        return 1
        ;;
      missing)
        echo -e "${RED}✗ not found${NC}"
        return 1
        ;;
    esac
    if [ "$elapsed" -ge "$max_wait" ]; then
      echo -e "${RED}✗ timed out${NC} after ${max_wait}s"
      error "  Check logs with: docker logs $name --tail 50"
      return 1
    fi
    sleep $interval
    elapsed=$((elapsed + interval))
    printf "."
  done
}

# Wait for each service in dependency order
wait_healthy "aios_postgres" 60  || die "PostgreSQL failed to start"
wait_healthy "aios_redis"    30  || die "Redis failed to start"
wait_healthy "aios_minio"    60  || die "MinIO failed to start"
wait_healthy "aios_backend"  120 || die "Backend failed to start"
wait_healthy "aios_frontend" 30  || die "Frontend failed to start"

# ── Step 8: Verify API is responding ─────────────────────────────────────────
step "Verifying API health"

API_URL="http://localhost/api/health"
log "  Checking $API_URL ..."

for i in $(seq 1 10); do
  if curl -sf "$API_URL" >/dev/null 2>&1; then
    HEALTH=$(curl -sf "$API_URL" 2>/dev/null)
    success "  ✓ API responding: $HEALTH"
    break
  fi
  if [ "$i" -eq 10 ]; then
    warn "  ⚠ API not responding at $API_URL"
    warn "    The app may still be starting. Try: curl $API_URL"
  fi
  sleep 3
done

# ── Step 9: Status summary ───────────────────────────────────────────────────
step "AIOS is running"

echo ""
echo -e "  ${BOLD}Service URLs${NC}"
echo -e "  ┌─────────────────────────────────────────────────────────────┐"
echo -e "  │  ${GREEN}App${NC}              http://localhost                           │"
echo -e "  │  ${BLUE}API${NC}              http://localhost/api/health                │"
echo -e "  │  ${BLUE}API Docs${NC}         http://localhost/api/docs                  │"
echo -e "  │  ${CYAN}LLM status${NC}       http://localhost/api/llm/status            │"
echo -e "  │  ${CYAN}Search status${NC}    http://localhost/api/search/status         │"
echo -e "  │  ${DIM}MinIO console${NC}    http://localhost:9001                       │"
echo -e "  └─────────────────────────────────────────────────────────────┘"

echo ""
echo -e "  ${BOLD}Running containers${NC}"
$COMPOSE_CMD -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" \
  | while IFS= read -r line; do echo "  $line"; done

echo ""
echo -e "  ${BOLD}Useful commands${NC}"
echo -e "  ${DIM}View logs:${NC}        ./start.sh --logs"
echo -e "  ${DIM}Backend logs:${NC}     docker logs aios_backend -f"
echo -e "  ${DIM}Worker logs:${NC}      docker logs aios_worker -f"
echo -e "  ${DIM}Stop everything:${NC}  ./stop.sh"
echo -e "  ${DIM}Rebuild + restart:${NC} ./start.sh --build"
echo -e "  ${DIM}Fresh start:${NC}      ./start.sh --clean"

# ── Step 10: Tail logs (optional) ────────────────────────────────────────────
if $TAIL_LOGS; then
  echo ""
  log "Tailing all logs (Ctrl+C to stop)..."
  $COMPOSE_CMD -f "$COMPOSE_FILE" logs -f --tail=50
fi

echo ""
success "Done. Open http://localhost in your browser."
echo ""
