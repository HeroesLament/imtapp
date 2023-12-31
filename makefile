# Directory where the Google Apps Scripts projects will be stored
SRC_DIR = src
CONFIG_FILE = .imtapp.json

# ANSI Color Codes
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
NC=\033[0m # No Color

setup-dev: dependency-check
	@echo "Setting up development environment..."
	@if [ ! -f "$(CONFIG_FILE)" ]; then \
		$(MAKE) create-config; \
	else \
		$(MAKE) use-existing-config; \
	fi

create-config:
	@echo -e "$(YELLOW)If the configuration file doesn't exist, create it!$(NC)"
	@echo "{" > $(CONFIG_FILE); \
	for dir in $(shell ls $(SRC_DIR)); do \
		read -p "Enter ScriptID for $$dir (or type 'ignore' to skip): " scriptId; \
		if [ "$$scriptId" != "ignore" ]; then \
			echo "\"$$dir\": \"$$scriptId\"," >> $(CONFIG_FILE); \
		fi; \
	done; \
	sed -i '$$s/,$$//' $(CONFIG_FILE); \
	echo "}" >> $(CONFIG_FILE)

use-existing-config:
	@echo -e "$(GREEN)Config exists!$(NC)"
	@for dir in $(shell ls $(SRC_DIR)); do \
		scriptId=$$(jq -r ".$$dir" $(CONFIG_FILE)); \
		if [ "$$scriptId" != "null" ]; then \
			echo "Using ScriptID $$scriptId for $$dir from $(CONFIG_FILE)"; \
			echo "{ \"scriptId\": \"$$scriptId\", \"rootDir\": \"$(PWD)/$(SRC_DIR)/$$dir\" }" > $(SRC_DIR)/$$dir/.clasp.json; \
			(cd $(SRC_DIR)/$$dir && clasp status); \
		fi; \
	done

dependency-check:
	@which clasp > /dev/null || (echo "Error: clasp is not installed. Please install it using 'npm install -g @google/clasp'." && exit 1)
	@which jq > /dev/null || (echo "Error: jq is not installed. Please install it using your package manager." && exit 1)

clean:
	@echo -e "$(RED)Cleaning up project configurations...$(NC)"
	@if [ -f "$(CONFIG_FILE)" ]; then \
		echo -e "$(RED)Removing $(CONFIG_FILE)...$(NC)"; \
		rm $(CONFIG_FILE); \
	else \
		echo -e "$(YELLOW)$(CONFIG_FILE) does not exist, nothing to remove.$(NC)"; \
	fi

	@for dir in $(shell ls $(SRC_DIR)); do \
		if [ -f "$(SRC_DIR)/$$dir/.clasp.json" ]; then \
			echo -e "$(RED)Removing $(SRC_DIR)/$$dir/.clasp.json...$(NC)"; \
			rm $(SRC_DIR)/$$dir/.clasp.json; \
		else \
			echo -e "$(YELLOW)$(SRC_DIR)/$$dir/.clasp.json does not exist, nothing to remove.$(NC)"; \
		fi; \
	done


.PHONY: setup-dev create-config use-existing-config dependency-check clean
