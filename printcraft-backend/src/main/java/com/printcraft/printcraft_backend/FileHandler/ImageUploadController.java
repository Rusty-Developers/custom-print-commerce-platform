package com.printcraft.printcraft_backend.FileHandler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class ImageUploadController {
    //injecting service
    private final FileStorageService fileStorageService;


    public ImageUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }
    //image upload API
    @PostMapping("/image")
    public ResponseEntity<?> uploadImages(@RequestParam("file")MultipartFile file){
        //can't accept empty
        if(file.isEmpty()){
            throw new RuntimeException("No file selected");
        }
        String fileUrl = fileStorageService.storeFilesURL(file);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "url", fileUrl

        ));
    }
}
