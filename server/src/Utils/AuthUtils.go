package utils

import (
	models "aarohi/src/Models"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT (user *models.User) (string, error) {
	secretKey := os.Getenv("JWT_SECRET");
	if secretKey == "" {
		return "", os.ErrInvalid;
	}

	claims := jwt.MapClaims {
		"id": user.ID.Hex(),
		"email": user.Email,
		"role": user.Role,
		"exp": time.Now().Add(2 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims);
	tokenString, err := token.SignedString([]byte(secretKey));
	if err != nil {
		return "", err;
	}

	return tokenString, nil;
}

func ValidateJWT(tokenString string) (jwt.MapClaims, error) {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		return nil, os.ErrInvalid
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, os.ErrInvalid
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, os.ErrInvalid
}