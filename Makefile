.PHONY: help backend-install backend-dev backend-db backend-seed backend-test backend-lint \
        frontend-install frontend-dev frontend-mock frontend-build frontend-typecheck gen-api

help:
	@echo "Friends App — common tasks"
	@echo ""
	@echo "Backend (/backend):"
	@echo "  make backend-install   create venv + install deps"
	@echo "  make backend-db        create tables (fast first pass)"
	@echo "  make backend-seed      seed the friend group"
	@echo "  make backend-dev       run FastAPI (Swagger at :8000/docs)"
	@echo "  make backend-test      run pytest"
	@echo "  make backend-lint      run ruff"
	@echo ""
	@echo "Frontend (/frontend):"
	@echo "  make frontend-install  npm install"
	@echo "  make frontend-dev      run Vite against the real backend (:5173)"
	@echo "  make frontend-mock     run Vite against the in-memory mock backend (no backend needed)"
	@echo "  make frontend-build    typecheck + production build"
	@echo "  make gen-api           regenerate typed API client from backend OpenAPI"

# ---- Backend ----
backend-install:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

backend-db:
	cd backend && . .venv/bin/activate && python -m scripts.create_db

backend-seed:
	cd backend && . .venv/bin/activate && python -m scripts.seed_profiles

backend-dev:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload

backend-test:
	cd backend && . .venv/bin/activate && pytest

backend-lint:
	cd backend && . .venv/bin/activate && ruff check .

# ---- Frontend ----
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-mock:
	cd frontend && VITE_USE_MOCKS=true npm run dev

frontend-build:
	cd frontend && npm run build

frontend-typecheck:
	cd frontend && npx tsc -b

gen-api:
	cd frontend && npm run gen:api
