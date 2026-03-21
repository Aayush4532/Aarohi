package middleware

import (
	utils "aarohi/src/Utils"
	"context"
	"net/http"
)

func UserMiddleware (next http.Handler) http.Handler {
	return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request)  {
		cookie, err := r.Cookie("token");
		if err != nil || cookie.Value == "" {
			http.Error(w, "Unauthorized: " + err.Error(), http.StatusUnauthorized);
			return;
		}

		claims, err := utils.ValidateJWT(cookie.Value);
		if err != nil {
			http.Error(w, "Unauthorized: " + err.Error(), http.StatusUnauthorized);
			return;
		}

		ctx := context.WithValue(r.Context(), "id", claims["id"]);
		next.ServeHTTP(w, r.WithContext(ctx));
	})
}


func AdminMiddleware (next http.Handler) http.Handler {
	return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request)  {
		cookie, err := r.Cookie("token");
		if err != nil || cookie.Value == "" {
			http.Error(w, "Unauthorized: " + err.Error(), http.StatusUnauthorized);
			return;
		}

		claims, err := utils.ValidateJWT(cookie.Value);
		if err != nil {
			http.Error(w, "Unauthorized: " + err.Error(), http.StatusUnauthorized);
			return;
		}

		if claims["role"] != "admin" {
			http.Error(w, "Forbidden: you don't have access to this resource", http.StatusForbidden);
			return;
		}
		ctx := context.WithValue(r.Context(), "id", claims["id"]);
		next.ServeHTTP(w, r.WithContext(ctx));
	})
}
