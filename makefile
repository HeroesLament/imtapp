# Directory where the Google Apps Scripts projects will be stored
SRC_DIR = src
CONFIG_FILE = .imtapp.json

setup-dev: dependency-check
	@echo "Setting up development environment..."
	# If the configuration file doesn't exist, create it
	@if [ ! -f "$(CONFIG_FILE)" ]; then \
		$(MAKE) create-config; \
	else \
		$(MAKE) use-existing-config; \
	fi

create-config:
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

.PHONY: setup-dev create-config use-existing-config
