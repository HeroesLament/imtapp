# Directory where the Google Apps Scripts projects will be stored
SRC_DIR = src
CONFIG_FILE = .imtapp.json

# Target to setup the dev environment
setup-dev:
	@echo "Setting up development environment..."
	@echo "{" > $(CONFIG_FILE)
	@for dir in $(shell ls $(SRC_DIR)); do \
		if [ -f "$(SRC_DIR)/$$dir/.clasp.json" ]; then \
			echo "Folder $$dir is already linked with a Google Apps Script project."; \
			scriptId=$$(cat $(SRC_DIR)/$$dir/.clasp.json | jq -r .scriptId); \
		else \
			read -p "Enter ScriptID for $$dir (or type 'ignore' to skip): " scriptId; \
			if [ "$$scriptId" != "ignore" ]; then \
				echo "Linking $$dir with ScriptID: $$scriptId"; \
				echo "{ \"scriptId\": \"$$scriptId\", \"rootDir\": \"$(PWD)/$(SRC_DIR)/$$dir\" }" > $(SRC_DIR)/$$dir/.clasp.json; \
			else \
				echo "Ignoring $$dir..."; \
				continue; \
			fi; \
		fi; \
		echo "Checking clasp status for $$dir..."; \
		(cd $(SRC_DIR)/$$dir && clasp status); \
		echo "\"$$dir\": \"$$scriptId\"," >> $(CONFIG_FILE); \
	done
	@sed -i '$$s/,$$//' $(CONFIG_FILE)  # Remove trailing comma from the last entry
	@echo "}" >> $(CONFIG_FILE)

.PHONY: setup-dev
