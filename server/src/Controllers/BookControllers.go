package controllers

import (
	config "aarohi/src/Config"
	models "aarohi/src/Models"
	utils "aarohi/src/Utils"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func AddBook(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "invalid form data", http.StatusBadRequest)
		return
	}

	title := strings.TrimSpace(r.FormValue("title"))
	author := strings.TrimSpace(r.FormValue("author"))
	pageCountStr := strings.TrimSpace(r.FormValue("page_count"))
	description := strings.TrimSpace(r.FormValue("description"))
	isbn := strings.TrimSpace(r.FormValue("isbn"))
	categoriesStr := strings.TrimSpace(r.FormValue("categories"))

	if title == "" || author == "" || pageCountStr == "" ||
		description == "" || isbn == "" || categoriesStr == "" {
		http.Error(w, "invalid book data", http.StatusBadRequest)
		return
	}

	pageCount, err := strconv.Atoi(pageCountStr)
	if err != nil || pageCount <= 0 {
		http.Error(w, "invalid page count", http.StatusBadRequest)
		return
	}

	rawCategories := strings.Split(categoriesStr, ",")
	var categories []string
	for _, c := range rawCategories {
		clean := strings.ToLower(strings.TrimSpace(c))
		if clean != "" {
			categories = append(categories, clean)
		}
	}

	if len(categories) == 0 {
		http.Error(w, "at least one category required", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "book thumbnail is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	bookID := primitive.NewObjectID()

	thumbnailURL, err := utils.UploadPhoto(header, bookID.Hex(), "book")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	book := models.Book{
		ID:          bookID,
		Title:       title,
		Author:      author,
		ISBN:        isbn,
		Description: description,
		PageCount:   pageCount,
		Categories:  categories,
		Thumbnail:   thumbnailURL,
		TotalRating: 0,
		TotalReview: 0,
		Reviews:     []models.Review{},
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	_, err = config.DB.Collection("Books").InsertOne(ctx, book)
	if err != nil {
		utils.DeleteFromR2("books", bookID.Hex()+".png")
		http.Error(w, "error adding book", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(book)
}

func GetBooks(w http.ResponseWriter, r *http.Request) {
	var books []models.Book

	limit := int64(10)
	page := int64(1)

	pageParam := r.URL.Query().Get("page")
	if pageParam != "" {
		if p, err := strconv.ParseInt(pageParam, 10, 64); err == nil && p > 0 {
			page = p
		}
	}

	bookType := r.URL.Query().Get("bookType")

	skip := (page - 1) * limit

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("Books")

	// Default filter
	filter := bson.M{}

	// Agar category filter chahiye
	if bookType != "" && bookType != "recommended" {
		filter = bson.M{
			"categories": bookType,
		}
	}

	total, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		http.Error(w, "Error counting books", http.StatusInternalServerError)
		return
	}

	findOptions := options.Find().
		SetLimit(limit).
		SetSkip(skip).
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetProjection(bson.M{
			"reviews": 0,
		})

	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		http.Error(w, "Error fetching books", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &books); err != nil {
		http.Error(w, "Error decoding books", http.StatusInternalServerError)
		return
	}

	totalPages := (total + limit - 1) / limit

	response := map[string]interface{}{
		"books":       books,
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func GetBookById(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	var book models.Book

	ctx, cancel := context.WithTimeout(r.Context(), 11*time.Second)
	defer cancel()

	err = config.DB.Collection("Books").FindOne(ctx, bson.M{"_id": objID}).Decode(&book)
	if err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(book)
}

func ReviewBook (w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}
	bookId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	userIdValue := r.Context().Value("id");
	if userIdValue == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userIdStr, ok := userIdValue.(string);
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userId, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var book models.Book;
	var review models.Review;
	var user models.User;
	if err := json.NewDecoder(r.Body).Decode(&review); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if review.Rating < 1 || review.Rating > 5 {
		http.Error(w, "Rating must be between 1 and 5", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(review.Review) == "" {
		http.Error(w, "Review text cannot be empty", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 11*time.Second)
	defer cancel()
	err = config.DB.Collection("Books").FindOne(ctx, bson.M{"_id": bookId}).Decode(&book);
	if err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}
	err = config.DB.Collection("users").FindOne(ctx, bson.M{"_id": userId}).Decode(&user);
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	check := false;
	for _, b := range user.ReadBooks {
		if b == bookId {
			check = true;
			break;
		}
	}
	if !check {
		http.Error(w, "You can only review books you have read", http.StatusBadRequest)
		return
	}

	for _, r := range user.RatedBooks {
		if r.BookID == bookId {
			http.Error(w, "You have already reviewed this book", http.StatusBadRequest)
			return
		}
	}
	
	review.ID = primitive.NewObjectID();
	review.UserID = userId;
	review.CreatedAt = time.Now();
	review.UpdatedAt = time.Now();
	review.FullName = user.Name;
	review.Profile = user.Profile;


	_, err = config.DB.Collection("Books").UpdateOne(ctx, bson.M{"_id": bookId}, bson.M{
		"$push": bson.M{"reviews": review},
		"$set": bson.M{
			"updated_at": time.Now(),
		},
		"$inc": bson.M{
			"total_rating" : float64(review.Rating),
			"total_review": 1,
		},
	})
	if err != nil {
		http.Error(w, "Error adding review", http.StatusInternalServerError)
		return
	}

	_, err = config.DB.Collection("users").UpdateOne(ctx, bson.M{"_id" : userId}, bson.M {
		"$push": bson.M{
			"rated_books": models.RatedBook{
				BookID: bookId,
				Rating: review.Rating,
			},
		},
	});
	if err != nil {
		http.Error(w, "Error updating user review data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Review added successfully",
	})
}

func StartReading(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	userIdValue := r.Context().Value("id")
	if userIdValue == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userIdStr, ok := userIdValue.(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 11*time.Second)
	defer cancel()

	err = config.DB.Collection("Books").
		FindOne(ctx, bson.M{"_id": objID}).
		Err()

	if err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	err = config.DB.Collection("users").FindOne(
		ctx,
		bson.M{
			"_id":                       userObjID,
			"currently_reading.book_id": objID,
		},
	).Err()

	if err == nil {
		http.Error(w, "You are already reading this book", http.StatusBadRequest)
		return
	}

	_, _ = config.DB.Collection("users").UpdateOne(
		ctx,
		bson.M{
			"_id":               userObjID,
			"currently_reading": bson.M{"$exists": false},
		},
		bson.M{
			"$set": bson.M{"currently_reading": []interface{}{}},
		},
	)

	_, err = config.DB.Collection("users").UpdateOne(
		ctx,
		bson.M{"_id": userObjID},
		bson.M{
			"$push": bson.M{
				"currently_reading": bson.M{
					"book_id":  objID,
					"current_page": 0,
					"complete": 0,
					"notes":    []string{},
				},
			},
		},
	)

	if err != nil {
		http.Error(w, "Error updating reading list", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Book added to currently reading list",
	})
}

func ReadBook(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}

	userIdValue := r.Context().Value("id")
	if userIdValue == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userIdStr, ok := userIdValue.(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userIdStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	type Body struct {
		Page  int    `json:"page"`
		Notes string `json:"notes"`
	}

	var b Body
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if b.Page <= 0 {
		http.Error(w, "Page count must be greater than 0", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var book models.Book
	if err := config.DB.Collection("Books").
		FindOne(ctx, bson.M{"_id": objID}).
		Decode(&book); err != nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	var user models.User

	err = config.DB.Collection("users").FindOne(
		ctx,
		bson.M{
			"_id":                       userObjID,
			"currently_reading.book_id": objID,
		},
	).Decode(&user)

	if err != nil || len(user.CurrentlyReading) == 0 {
		http.Error(w, "You are not currently reading this book", http.StatusBadRequest)
		return
	}

	index := -1

	for i, book := range user.CurrentlyReading {
		if book.BookID == objID {
			index = i
			break
		}
	}

	if index == -1 {
		http.Error(w, "You are not currently reading this book", http.StatusBadRequest)
		return
	}

	prevPage := user.CurrentlyReading[index].CurrentPage
	newPage := min(prevPage+b.Page, book.PageCount)
	percent := min(int((float64(newPage)/float64(book.PageCount))*100), 100)

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	if newPage == book.PageCount {
		update := bson.M{
			"$pull": bson.M{
				"currently_reading": bson.M{
					"book_id": objID,
				},
			},
			"$addToSet": bson.M{
				"read_books": objID,
				"read_dates": today,
			},
			"$inc": bson.M{
				"total_pages_read": b.Page,
				"total_books_read": 1,
			},
			"$set": bson.M{
				"updated_at": time.Now(),
			},
		}

		_, err := config.DB.Collection("users").UpdateOne(
			ctx,
			bson.M{"_id": userObjID},
			update,
		)

		if err != nil {
			http.Error(w, "Error marking book as completed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":       "Book completed successfully",
			"book_finished": true,
		})

		return
	}

	update := bson.M{
		"$set": bson.M{
			"currently_reading.$.current_page": newPage,
			"currently_reading.$.complete":     percent,
			"updated_at":                       time.Now(),
		},
		"$inc": bson.M{
			"total_pages_read": b.Page,
		},
		"$addToSet": bson.M{
			"read_dates": today,
		},
	}

	if b.Notes != "" {
		update["$push"] = bson.M{
			"currently_reading.$.notes": b.Notes,
		}
	}

	result, err := config.DB.Collection("users").UpdateOne(
		ctx,
		bson.M{
			"_id":                       userObjID,
			"currently_reading.book_id": objID,
		},
		update,
	)

	if err != nil || result.ModifiedCount == 0 {
		http.Error(w, "Failed to update progress", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Reading progress updated",
		"pages_today":   b.Page,
		"total_page":    newPage,
		"percent_done":  percent,
		"book_finished": false,
	})
}
