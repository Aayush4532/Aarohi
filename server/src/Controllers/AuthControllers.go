package controllers

import (
	config "aarohi/src/Config"
	models "aarohi/src/Models"
	utils "aarohi/src/Utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid request body"))
		return
	}

	if user.Email == "" || user.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("email and password are required"))
		return
	}

	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 11*time.Second)
	defer cancel()

	var foundUser models.User
	findUserError := collection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser)
	if findUserError != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error while finding user: ", findUserError)
		w.Write([]byte("some error occured while decoding user data"))
		return
	}

	if findUserError == mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("user with that email does not exist"))
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password))
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("invalid password"))
		return
	}

	tokenString, err := utils.GenerateJWT(&foundUser)
	if err != nil {
		http.Error(w, "Error generating token", 500)
		return
	}

	gap := time.Since(foundUser.LastActiveDate)
	daysDiff := int(gap.Hours() / 24)

	newStreak := foundUser.Streak
	if daysDiff > 1 {
		newStreak = 0
	}

	update := bson.M{
		"$set": bson.M{
			"streak": newStreak,
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": foundUser.ID}, update)
	if err != nil {
		http.Error(w, "Error updating user data", 500)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  time.Now().Add(2 * time.Hour),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})
	toShareUser := foundUser
	toShareUser.Password = ""
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(toShareUser)
}

func Signup(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid request body"))
		return
	}

	if user.Email == "" || user.Password == "" || user.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("email, password and name are required"))
		return
	}

	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 11*time.Second)
	defer cancel()

	count, err := collection.CountDocuments(ctx, bson.M{"email": user.Email})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("some error occured while checking for existing user"))
		return
	}

	if count > 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("user with this email already exists"))
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 16)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("some error occured"))
		return
	}

	user.Password = string(hashedPassword)
	user.Role = "user"
	user.LastActiveDate = time.Now()
	user.Streak = 0
	user.LongestStreak = 0
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.RatedBooks = []models.RatedBook{}
	user.ReadDates = []time.Time{}
	user.ReadBooks = []primitive.ObjectID{}
	user.CurrentlyReading = []models.CurrentlyReading{}

	user.ID = primitive.NewObjectID()
	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("some error occured while creating user: " + err.Error()))
		return
	}

	tokenString, err := utils.GenerateJWT(&user)
	if err != nil {
		http.Error(w, "Error generating token", 500)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  time.Now().Add(2 * time.Hour),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	w.WriteHeader(http.StatusCreated)
	user.Password = ""
	json.NewEncoder(w).Encode(user)
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	userIdValue := r.Context().Value("id")
	if userIdValue == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	objectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(r.Context(), 11*time.Second)
	defer cancel()

	var user models.User
	err = collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	user.Password = ""
	json.NewEncoder(w).Encode(user)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var newUser models.User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("invalid request body"))
		return
	}

	userIdValue := r.Context().Value("id")
	if userIdValue == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	objectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(r.Context(), 11*time.Second)
	defer cancel()

	var user models.User
	err = collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	updateFields := bson.M{}

	if newUser.Name != "" {
		updateFields["name"] = newUser.Name
	}

	if newUser.Email != "" {
		http.Error(w, "changing email not allowed", http.StatusBadRequest)
		return
	}

	if newUser.Age != 0 {
		updateFields["age"] = newUser.Age
	}

	if len(updateFields) == 0 {
		http.Error(w, "No fields to update", http.StatusBadRequest)
		return
	}

	update := bson.M{
		"$set": updateFields,
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objectId}, update)
	if err != nil {
		http.Error(w, "Error updating user", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("user updated successfully"))
}

func UploadProfilePicture(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(5 << 20)
	if err != nil {
		http.Error(w, "invalid form data", http.StatusBadRequest)
		return
	}
	userIdValue := r.Context().Value("id")
	if userIdValue == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	objectId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "profile image required", http.StatusBadRequest)
		return
	}
	file.Close()

	imageURL, err := utils.UploadPhoto(header, userId, "profile")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	_, err = collection.UpdateOne(ctx,
		bson.M{"_id": objectId},
		bson.M{"$set": bson.M{"profile": imageURL}},
	)
	if err != nil {
		http.Error(w, "failed to update profile picture", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"profile picture updated successfully","profile_image":"` + imageURL + `"}`))
}

// i need to implement for profile feature right now as well.
