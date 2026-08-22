package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var homeTemplate = template.Must(template.ParseFiles("templates/home.html"))

func homeHandler(w http.ResponseWriter, r *http.Request) {
	err := homeTemplate.Execute(w, nil)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")

}
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthHandler)
	mux.HandleFunc("GET /", homeHandler)

	log.Println("Server is running: http://localhost:8080")

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal(err)
	}
}
