package logic

import (
	"os"
	"path/filepath"
)

func GetBase() string {
	dirname, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	dirname = filepath.Join(dirname, "Desktop", "Delaughter")
	return dirname
}

func MakeBase() string {
	dirname := GetBase()
	err := os.MkdirAll(dirname, os.ModePerm)
	if err != nil {
		return ""
	}
	return dirname
}
