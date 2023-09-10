# Directory where the Google Apps Scripts projects will be stored
SRC_DIR = src
CONFIG_FILE = .imtapp.json

# Target to setup the dev environment
setup-dev:
	@echo "Setting up development environment..."
	
	@if [ -f "$(CONFIG_FILE)" ]; then \
		echo "Configuration file $(CONFIG_FILE) found. Using it for setting up."; \
	else \
		echo "{" > $(CONFIG_FILE); \
	fi
	
	@for dir in $(shell ls $(SRC_DIR)); do \
		if [ -f "$(CONFIG_FILE)" ]; then \
			scriptId=$$(jq -r ".$$dir" $(CONFIG_FILE)); \
			if [ "$$scriptId" != "null" ]; then \
				echo "Using ScriptID $$scriptId for $$dir from $(CONFIG_FILE)"; \
			else \
				read -p "Enter ScriptID for $$dir (or type 'ignore' to skip): " scriptId; \
			fi; \
		else \
			read -p "Enter ScriptID for $$dir (or type 'ignore' to skip): " scriptId; \
		fi; \
		if [ "$$scriptId" != "ignore" ]; then \
			echo "Linking $$dir with ScriptID: $$scriptId"; \
			echo "{ \"scriptId\": \"$$scriptId\", \"rootDir\": \"$(PWD)/$(SRC_DIR)/$$dir\" }" > $(SRC_DIR)/$$dir/.clasp.json; \
			echo "\"$$dir\": \"$$scriptId\"," >> $(CONFIG_FILE); \
		else \
			echo "Ignoring $$dir..."; \
			continue; \
		fi; \
		echo "Checking clasp status for $$dir..."; \
		(cd $(SRC_DIR)/$$dir && clasp status); \
	done
	
	@if [ ! -f "$(CONFIG_FILE)" ]; then \
		sed -i '$$s/,$$//' $(CONFIG_FILE);  # Remove trailing comma from the last entry
		echo "}" >> $(CONFIG_FILE); \
	fi

.PHONY: setup-dev
