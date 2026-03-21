package routes

import (
	controllers "aarohi/src/Controllers"
	middleware "aarohi/src/Middleware"
	"net/http"
)

func AuthGroup(mux *http.ServeMux) {
	mux.HandleFunc("POST /auth/login", controllers.Login)
	mux.HandleFunc("POST /auth/signup", controllers.Signup)
	mux.Handle("GET /user", middleware.UserMiddleware(http.HandlerFunc(controllers.GetProfile)))
	mux.Handle("PUT /user", middleware.UserMiddleware(http.HandlerFunc(controllers.UpdateProfile)))
	mux.Handle("PUT /api/uploadProfile", middleware.UserMiddleware(http.HandlerFunc(controllers.UploadProfilePicture)))
	mux.Handle("GET /api/isUser", middleware.UserMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("User is authenticated"))
	})))
	mux.Handle("GET /api/isAdmin", middleware.AdminMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("User is authenticated"))
	})))
}