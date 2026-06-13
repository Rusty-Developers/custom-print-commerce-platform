package com.printcraft.printcraft_backend.FileHandler;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    private final String uploadDir = "uploads/";
    public String storeFilesURL(MultipartFile file){
        try{
            //Create uploads/ folder if missing — use Files.createDirectories()
            Path uploadPath = Paths.get(uploadDir);
            if(!Files.exists(uploadPath)){
                uploadPath= Files.createDirectories(uploadPath);
            }
            //Generate unique filename — UUID + original extension to make store (uniquely, Avoid over-riding)
            String originalFileName = file.getOriginalFilename();
            String ext = originalFileName.substring(originalFileName.lastIndexOf("."));
            String uniqueFilenameUUID = UUID.randomUUID().toString() + ext;
            //save file in db
            Path filepath = uploadPath.resolve(uniqueFilenameUUID);
            //// filepath = uploads/a1b2c3-uuid.jpg  ← full path object
            //now convert into bytes-It needs the actual byte stream from the uploaded file.
            Files.copy(file.getInputStream(),filepath);
            //originalFileName is a String, but Files.copy() needs an InputStream as the first argument.
            return "/uploads/" + uniqueFilenameUUID;
            //// returns → "/uploads/a1b2c3-uuid.jpg"

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
