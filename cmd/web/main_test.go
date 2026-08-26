package main

import (
	"os"
	"testing"
)

func TestValidateRoleValid(t *testing.T) {
	role := Role{
		Title:      "[TEST] Backend Engineer",
		Department: "Engineering",
		Location:   "Limassol, Cyprus",
		Slug:       "test-backend-engineer",
	}
	err := validateRole(role)
	if err == nil {
		t.Fatalf("expected valid role, got error: %v", err)
	}
}
func TestValidateRoleMissingTitle(t *testing.T) {
	role := Role{
		Title:      "",
		Department: "Engineering",
		Location:   "Limassol, Cyprus",
		Slug:       "test-backend-engineer",
	}
	err := validateRole(role)
	if err == nil {
		t.Fatal("expected error for missing title, got nil")
	}
}
func TestFindRoleBySlugFound(t *testing.T) {
	roles := []Role{
		{
			Title:      "[TEST] Backend Engineer",
			Department: "Engineering",
			Location:   "Limassol, Cyprus",
			Slug:       "test-backend-engineer",
		},
		{
			Title:      "[TEST] Game Designer",
			Department: "Design",
			Location:   "Limassol, Cyprus",
			Slug:       "test-game-designer",
		},
	}
	role, found := findRoleBySlug(roles, "test-game-designer")
	if !found {
		t.Fatal("expected role to be found")
	}
	if role.Slug != "test-game-designer" {
		t.Fatalf("expected slug test-game-designer, got %s", role.Slug)
	}
}
func TestFindRoleBySlugNotFound(t *testing.T) {
	roles := []Role{
		{
			Title:      "[TEST] Backend Engineer",
			Department: "Engineering",
			Location:   "Limassol, Cyprus",
			Slug:       "test-backend-engineer",
		},
	}
	role, found := findRoleBySlug(roles, "banana")

	if found {
		t.Fatalf("expected role not to be found")
	}
	if role.Slug != "" {
		t.Fatalf("expected empty role, got slug %s", role.Slug)
	}
}
func TestLoadRolesValidFile(t *testing.T) {
	tempDir := t.TempDir() // creates temporary dir for testing and then it cleans it by itself
	path := tempDir + "/roles.json"
	data := `[
		{
			"title": "[TEST] Backend Engineer", 
			"department": "Engineering",
			"location": "Limassol, Cyprus",
			"slug": "test-backend-engineer"
		}
	]`
	err := os.WriteFile(path, []byte(data), 0644)
	if err != nil {
		t.Fatalf("failed to create test file: %v", err)
	}

	roles, err := loadRoles(path)
	if err != nil {
		t.Fatalf("expected valid file, got error: %v", err)
	}
	if len(roles) != 1 {
		t.Fatalf("expected 1 role, got %d", len(roles))
	}
	if roles[0].Slug != "test-backend-engineer" {
		t.Fatalf("expected slug test-backend-engineer, got %s", roles[0].Slug)
	}
}
func TestLoadRolesMalformedJSON(t *testing.T) {
	tempDir := t.TempDir()
	path := tempDir + "/roles.json"

	data := `
		[
			"title": "[TEST] Backend Engineer",
			"department": "Engineering",
			"location": "Limassol, Cyprus",
			"slug": "test-backend-engineer"

		]
	`
	err := os.WriteFile(path, []byte(data), 0644)
	if err != nil {
		t.Fatalf("failed to create test file: %v", err)
	}
	_, err = loadRoles(path)

	if err == nil {
		t.Fatalf("expected error for malformed JSON, got nil")
	}
}
func TestLoadMissingFile(t *testing.T) {
	path := t.TempDir() + "/missing.json"

	_, err := loadRoles(path)
	if err == nil {
		t.Fatalf("expected error for missing file, got nil")
	}
}
func TestLoadRolesInvalidRole(t *testing.T) {
	path := t.TempDir() + "/roles.json"
	data := `[
		{
			"title": "",
			"department": "Engineering",
			"location": "Limassol, Cyprus",
			"slug": "test-backend-engineer"
		}
	]`

	err := os.WriteFile(path, []byte(data), 0644)
	if err != nil {
		t.Fatalf("failed to create test file: %v", err)
	}

	_, err = loadRoles(path)

	if err == nil {
		t.Fatalf("expected error for invalid role, got nil")
	}
}
