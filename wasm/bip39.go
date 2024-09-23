package main

import (
	"crypto/sha256"
	"slices"
	"strings"
	"syscall/js"

	"github.com/tyler-smith/go-bip39"
)

func Mnemonic(this js.Value, args []js.Value) interface{} {
	output := make(map[string]interface{})
	if len(args) != 2 {
		output["error"] = "invalid arguments. expected: recipient1, recipient2"
		return output
	}
	r1 := args[0].String()
	r2 := args[1].String()
	m, err := mnemonic([]string{r1, r2})
	if err != nil {
		output["error"] = err.Error()
		return output
	}
	output["output"] = m
	return output
}

func mnemonic(recipients []string) (string, error) {
	slices.Sort(recipients)
	pubsig := strings.Join(recipients, "")
	hash := sha256.Sum256([]byte(pubsig))
	return bip39.NewMnemonic(hash[:])
}
