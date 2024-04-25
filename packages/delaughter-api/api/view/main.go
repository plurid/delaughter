package view

import (
	"net/http"

	"delaughter-api/api/controller"
	"delaughter-api/api/logic"

	"github.com/gin-gonic/gin"
)

type File struct {
	Name string `uri:"name" binding:"required"`
}

func StartServer() {
	logic.MakeBase()

	router := gin.Default()
	api := router.Group("/api")
	v1 := api.Group("/v1")
	file := v1.Group("/file")
	files := v1.Group("/files")

	file.POST("/", func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		n, counter, err := controller.UploadFile(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"success": "Uploaded successfully",
			"file":    n,
			"counter": counter,
		})
	})

	files.POST("/", func(c *gin.Context) {
		err := c.Request.ParseMultipartForm(100 << 20) // 100 MB maximum request size
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		form := c.Request.MultipartForm
		files := form.File["files"]
		known_counter := c.PostForm("counter")

		filenames, counter, err := controller.UploadFiles(known_counter, files)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": "Uploaded successfully",
			"files":   filenames,
			"counter": counter,
		})
	})

	files.GET("/:name/", func(c *gin.Context) {
		var f File
		if err := c.ShouldBindUri(&f); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err})
			return
		}
		m, cn, err := controller.Download(f.Name)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err})
			return
		}
		c.Header("Content-Disposition", "attachment; filename="+f.Name)
		c.Data(http.StatusOK, m, cn)
	})

	_ = router.Run(":9199")
}
