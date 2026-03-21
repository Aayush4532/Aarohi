package routes

import (
	controllers "aarohi/src/Controllers"
	middleware "aarohi/src/Middleware"
	"net/http"
)

func BookGroup(mux *http.ServeMux) {
	mux.Handle("GET /api", middleware.UserMiddleware(http.HandlerFunc(controllers.GetBooks)))
	mux.Handle("POST /api/addBook", middleware.AdminMiddleware(http.HandlerFunc(controllers.AddBook)))
	mux.Handle("GET /api/book/{id}", middleware.UserMiddleware(http.HandlerFunc(controllers.GetBookById)))
	mux.Handle("POST /api/start/{id}", middleware.UserMiddleware(http.HandlerFunc(controllers.StartReading)))
	mux.Handle("POST /api/read/{id}", middleware.UserMiddleware(http.HandlerFunc(controllers.ReadBook)))
	mux.Handle("POST /api/review/{id}", middleware.UserMiddleware(http.HandlerFunc(controllers.ReviewBook)))
}
