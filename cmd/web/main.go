package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
)

type Role struct {
	Title      string `json:"title"`
	Department string `json:"department"`
	Location   string `json:"location"`
	Slug       string `json:"slug"`
}

type CareersPageData struct {
	Roles     []Role
	LoadError bool
}

var roles = []Role{}
var rolesLoadError error
var homeTemplate *template.Template
var careersTemplate *template.Template
var notFoundTemplate *template.Template
var roleTemplate *template.Template

func loadRoles(path string) ([]Role, error) {
	data, err := os.ReadFile(path)

	if err != nil {
		return nil, err
	}
	var roles []Role

	err = json.Unmarshal(data, &roles)

	if err != nil {
		return nil, err
	}

	for idx := 0; idx < len(roles); idx++ {
		err = validateRole(roles[idx])
		if err != nil {
			return nil, err
		}
	}
	return roles, nil
}

func findRoleBySlug(roles []Role, slug string) (Role, bool) {
	for idx := 0; idx < len(roles); idx++ {
		if roles[idx].Slug == slug {
			return roles[idx], true
		}

	}
	return Role{}, false
}
func validateRole(role Role) error {
	if role.Title == "" {
		return fmt.Errorf("role title is required")
	}

	if role.Department == "" {
		return fmt.Errorf("role department is required")
	}

	if role.Location == "" {
		return fmt.Errorf("role location is required")
	}

	if role.Slug == "" {
		return fmt.Errorf("role slug is required")
	}

	return nil
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path != "/" {
		notFoundHandler(w, r)
		return
	}
	err := homeTemplate.ExecuteTemplate(w, "base.html", nil)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
func careersHandler(w http.ResponseWriter, r *http.Request) {

	pageData := CareersPageData{
		Roles:     roles,
		LoadError: rolesLoadError != nil, //returns bool, if there is mistake true if not - false
	}
	err := careersTemplate.ExecuteTemplate(w, "base.html", pageData)

	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")

}

func roleHandler(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	role, found := findRoleBySlug(roles, slug)

	if !found {
		notFoundHandler(w, r)
		return
	}

	err := roleTemplate.ExecuteTemplate(w, "base.html", role)

	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)

	err := notFoundTemplate.ExecuteTemplate(w, "base.html", nil)
	if err != nil {
		log.Printf("failed to render 404 page: %v", err)
	}
}
func main() {
	homeTemplate = template.Must(template.ParseFiles("templates/base.html", "templates/home.html"))
	careersTemplate = template.Must(template.ParseFiles("templates/base.html", "templates/careers.html"))
	roleTemplate = template.Must(template.ParseFiles("templates/base.html", "templates/role.html"))
	notFoundTemplate = template.Must(template.ParseFiles("templates/base.html", "templates/notfound.html"))
	loadedRoles, err := loadRoles("data/roles.json")

	if err != nil {
		log.Printf("failed to load roles: %v", err)
		rolesLoadError = err
	} else {
		roles = loadedRoles
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthHandler)
	mux.HandleFunc("GET /", homeHandler)
	mux.HandleFunc("GET /careers", careersHandler)
	mux.HandleFunc("GET /careers/{slug}", roleHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s", port)
	err = http.ListenAndServe(":"+port, mux)

	if err != nil {
		log.Fatal(err)
	}
}
