//go:build mage
// +build mage

package main

import (
	"fmt"
	"os"

	// mage:import

	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

// Default configures the default target.
var Default = Build

// Build builds the binaries.
func Build() error {
	return sh.RunV("go", "build", "./...")
}

// Test runs backend tests.
func Test() error {
	return sh.RunV("go", "test", "./...")
}

// Coverage runs backend tests and creates a coverage report.
func Coverage() error {
	fmt.Println("Running backend tests with coverage...")
	if err := sh.Run("go", "test", "./...", "-coverprofile=coverage.out"); err != nil {
		return err
	}
	return sh.Run("go", "tool", "cover", "-html=coverage.out", "-o", "coverage.html")
}

func Lint() error {
	if err := sh.RunV("golangci-lint", "run", "./..."); err != nil {
		return err
	}
	return nil
}

// Check runs all checks (tests, coverage, and linting).
func Check() {
	mg.SerialDeps(Test, Coverage, Lint)
}

// Clean removes build artifacts.
func Clean() error {
	fmt.Println("Cleaning...")
	return os.RemoveAll("dist")
}
