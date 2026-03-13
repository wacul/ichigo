.PHONY: lint test install man

VERSION := `git vertag get`
COMMIT  := `git rev-parse HEAD`

lint:
	golangci-lint run

test: lint
	go test -v --race ./...

install: test
	go install -a -ldflags "-X=main.version=$(VERSION) -X=main.commit=$(COMMIT)" ./...

man: test
	go run main.go --help-man > ichigo.1
