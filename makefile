# Directory where the Google Apps Scripts projects will be stored
SRC_DIR = src

# Target to setup the dev environment
setup-dev:
	@echo "Setting up development environment..."
	@for dir in $(shell ls $(SRC_DIR)); do \
		if [ -f "$(SRC_DIR)/$$dir/.clasp.json" ]; then \
			echo "Folder $$dir is already linked with a Google Apps Script project."; \
		else \
			read -p "Enter ScriptID for $$dir (or type 'ignore' to skip): " id; \
			if [ "$$id" != "ignore" ]; then \
				echo "Linking $$dir with ScriptID: $$id"; \
				echo "{ \"scriptId\": \"$$id\", \"rootDir\": \"$(PWD)/$(SRC_DIR)/$$dir\" }" > $(SRC_DIR)/$$dir/.clasp.json; \
			else \
				echo "Ignoring $$dir..."; \
				continue; \
			fi; \
		fi; \
		echo "Checking clasp status for $$dir..."; \
		(cd $(SRC_DIR)/$$dir && clasp status); \
	done

.PHONY: setup-dev
