.PHONY: dev build preview typecheck lint format test check clean release help

## Development
dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

## Code quality
typecheck:
	npm run typecheck

lint:
	npm run lint

format:
	npm run format

test:
	npm test

test-watch:
	npm run test:watch

## Combined check (runs before committing / releasing)
check: typecheck lint test
	@echo "All checks passed."

## Clean build artifacts
clean:
	rm -rf dist coverage

## Release helpers
## Usage: make release VERSION=0.2.0
release:
ifndef VERSION
	$(error VERSION is not set. Usage: make release VERSION=x.y.z)
endif
	@echo "Releasing v$(VERSION)..."
	@git diff --quiet || (echo "Working tree is dirty — commit your changes first." && exit 1)
	@git diff --cached --quiet || (echo "Staged changes present — commit first." && exit 1)
	$(MAKE) check
	npm run build
	git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	git push origin "v$(VERSION)"
	gh release create "v$(VERSION)" \
		--title "v$(VERSION)" \
		--notes-file CHANGELOG.md \
		--latest
	@echo "Released v$(VERSION) — check https://github.com/fjacquet/vgpu-advisor/releases"

## Help
help:
	@echo "vGPU Advisor — available targets:"
	@echo ""
	@echo "  dev          Start Vite dev server"
	@echo "  build        Production build (TypeScript + Vite)"
	@echo "  preview      Build then start preview server"
	@echo "  typecheck    TypeScript type check"
	@echo "  lint         Biome lint check"
	@echo "  format       Biome auto-format (writes files)"
	@echo "  test         Run Vitest unit tests"
	@echo "  test-watch   Run Vitest in watch mode"
	@echo "  check        typecheck + lint + test (pre-release gate)"
	@echo "  clean        Remove dist/ and coverage/"
	@echo "  release      VERSION=x.y.z  Tag, push, and create GitHub release"
	@echo "  help         Show this help"
