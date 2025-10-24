# Makefile for DependencyAnalysis project

# Default target
.PHONY: help
help: ## Display this help message
	@echo "Available targets:"
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

.PHONY: install
install: ## Install project dependencies
	npm install

.PHONY: build
build: ## Compile TypeScript source code
	npm run build

.PHONY: clean
clean: ## Remove compiled output
	npm run clean

.PHONY: dev
dev: ## Start development mode with watch
	npm run dev

.PHONY: start
start: ## Run the compiled application
	npm start

.PHONY: test
test: ## Run tests
	npm test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	npm run test:watch

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	npm run test:coverage

.PHONY: lint
lint: ## Lint source files
	npm run lint

.PHONY: lint-fix
lint-fix: ## Fix lint issues automatically
	npm run lint:fix

.PHONY: check
check: ## Run build, lint and test
	npm run build && npm run lint && npm test

.PHONY: watch
watch: ## Watch files and rebuild on changes
	npm run build:watch

# For Windows compatibility (if needed)
.PHONY: install-win
install-win: ## Install dependencies (Windows)
	cmd /c "npm install"

.PHONY: build-win
build-win: ## Build for Windows
	cmd /c "npm run build"