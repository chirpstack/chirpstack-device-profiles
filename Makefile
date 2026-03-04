.PHONY: test nix-start nix-test

serve:
	docker pull --platform=linux/amd64 chirpstack/chirpstack-device-profiles:latest
	docker run --rm -u $(id -u):$(id -g) -p 8090:8090 -v '$(shell pwd):/chirpstack-device-profiles' chirpstack/chirpstack-device-profiles:latest -p /chirpstack-device-profiles

build:
	cd interface && make api ui release-amd64

dev-shell:
	nix-shell

test:
	cd interface && make api ui
	cd interface && cargo run run-tests

dev-dependencies:
	cargo install cross --git https://github.com/cross-rs/cross --rev c7dee4d008475ce1c140773cbcd6078f4b86c2aa --locked
