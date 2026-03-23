package routes

import (
	controllers "aarohi/src/Controllers"
	middleware "aarohi/src/Middleware"
	"net/http"
)

func ForumGroup (mux *http.ServeMux) {
	mux.Handle("POST /api/chat/{id}", middleware.UserMiddleware(http.HandlerFunc(controllers.SendChat)));
	mux.Handle("GET /api/chat/{id}", middleware.UserMiddleware(http.HandlerFunc(controllers.GetChats)));
	mux.Handle("DELETE /api/chat/{id}", middleware.UserMiddleware(http.HandlerFunc(controllers.DeleteChat)));
}