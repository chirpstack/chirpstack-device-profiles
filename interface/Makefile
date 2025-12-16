.PHONY: api ui

PROTOC_PATH := ./ui/node_modules/grpc-tools/bin/protoc
PROTOC_ARGS := -I=./api --js_out=import_style=commonjs:./api/grpc-web --grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:./api/grpc-web/

release-amd64:
	cross build --target x86_64-unknown-linux-musl --release

api:
	cd ui && yarn install

	mkdir -p ui/src/api
	$(PROTOC_PATH) $(PROTOC_ARGS) api/api.proto

ui:
	cd ui && yarn add file:../api/grpc-web && yarn install && yarn build
