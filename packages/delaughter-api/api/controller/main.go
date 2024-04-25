package controller

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"sync"
	"time"

	"delaughter-api/api/logic"
)

var counter int = 0
var mu sync.Mutex

func UploadFile(file *multipart.FileHeader) (string, string, error) {
	dirname := logic.GetBase()

	src, err := file.Open()
	if err != nil {
		return "", "", err
	}
	defer src.Close()
	mu.Lock()
	padded_counter := fmt.Sprintf("%09d", counter)
	n := fmt.Sprintf("%s_%d_%s", padded_counter, time.Now().UTC().Unix(), file.Filename)
	counter++
	mu.Unlock()
	dst := fmt.Sprintf("%s/%s", dirname, n)
	out, err := os.Create(dst)
	if err != nil {
		return "", "", err
	}
	defer out.Close()

	_, err = io.Copy(out, src)

	return n, padded_counter, err
}

func UploadFiles(known_counter string, files []*multipart.FileHeader) ([]string, string, error) {
	dirname := logic.GetBase()
	var filenames []string

	padded_counter := ""
	if known_counter == "" {
		mu.Lock()
		padded_counter = fmt.Sprintf("%09d", counter)
		counter++
		mu.Unlock()
	} else {
		padded_counter = known_counter
	}

	for _, file := range files {
		src, err := file.Open()
		if err != nil {
			return filenames, padded_counter, err
		}
		defer src.Close()

		n := fmt.Sprintf("%s_%d_%s", padded_counter, time.Now().UTC().Unix(), file.Filename)

		dst := fmt.Sprintf("%s/%s", dirname, n)
		out, err := os.Create(dst)
		if err != nil {
			return filenames, padded_counter, err
		}
		defer out.Close()

		_, err = io.Copy(out, src)
		if err != nil {
			return filenames, padded_counter, err
		}

		filenames = append(filenames, n)
	}

	return filenames, padded_counter, nil
}

func Download(n string) (string, []byte, error) {
	dirname := logic.GetBase()

	dst := fmt.Sprintf("%s/%s", dirname, n)
	b, err := os.ReadFile(dst)
	if err != nil {
		return "", nil, err
	}
	m := http.DetectContentType(b[:512])

	return m, b, nil
}
