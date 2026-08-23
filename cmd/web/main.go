package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
)

var homeTemplate = template.Must(template.ParseFiles("templates/base.html", "templates/home.html"))
var careersTemplate = template.Must(template.ParseFiles("templates/base.html", "templates/careers.html"))

type Role struct {
	Title      string `json: "title"`
	Department string `json: "department"`
	Location   string `json: "location"`
	Slug       string `json: "slug"`
}

func loadRoles() ([]Role, error) {
	data, err := os.ReadFile("data/roles.json")

	if err != nil {
		return nil, err
	}
	var roles []Role

	err = json.Unmarshal(data, &roles)

	if err != nil {
		return nil, err
	}
	return roles, nil
}

var roles = []Role{}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	err := homeTemplate.ExecuteTemplate(w, "base.html", nil)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
func careersHandler(w http.ResponseWriter, r *http.Request) {
	err := careersTemplate.ExecuteTemplate(w, "base.html", roles)

	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")

}
func main() {
	loadedRoles, err := loadRoles()

	if err != nil {
		log.Fatal(err)
	}

	roles = loadedRoles

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthHandler)
	mux.HandleFunc("GET /", homeHandler)
	mux.HandleFunc("GET /careers", careersHandler)

	log.Println("Server is running: http://localhost:8080")

	err = http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal(err)
	}
}
