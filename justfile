set shell := ["bash", "-eu", "-o", "pipefail", "-c"]
set dotenv-load := true

plugin_id := "supernote-companion"
vault_plugins_dir := env_var("OBSIDIAN_PLUGINS_DIR")
dest_dir := "{{vault_plugins_dir}}/{{plugin_id}}"

# Build plugin bundle
build:
	npm run build

# Deploy this plugin to local Obsidian vault plugins directory
# Destination: ~/obsidian/noted-brain/plugins/supernote-companion/
deploy-local: build
	mkdir -p "{{dest_dir}}"
	cp main.js manifest.json styles.css "{{dest_dir}}/"
	echo "Deployed to {{dest_dir}}"
