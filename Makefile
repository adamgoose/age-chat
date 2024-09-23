.PHONY: all
all: public/age.wasm src/wasm/wasm_exec.js

public/age.wasm: $(wildcard wasm/*.go)
	GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o $@ ./wasm

src/wasm/wasm_exec.js:
	cat "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" $< > $@
