package main

import (
	config "aarohi/src/Config"
	routes "aarohi/src/Routes"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("Frontend_URI"));
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	godotenv.Load();
	PORT := os.Getenv("PORT");
	mux := http.NewServeMux();

	routes.AuthGroup(mux);
	routes.BookGroup(mux);
	routes.ForumGroup(mux);
	
	error := config.ConnectDB();
	if error != nil {
		log.Fatal("some error occured during db connection", error);
		return;
	}
	config.InitR2();
	fmt.Println("server is running on the port : ", PORT);
	err := http.ListenAndServe(":" + PORT, enableCORS(mux));
	if err != nil {
		log.Fatal(err);
	}
}
