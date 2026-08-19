package com.queue.smart_queue.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Pattern;

@Data
public class TokenRequest {

    @NotBlank(message = "Name is required")
    private String name;


    @NotBlank(message = "phoneNumber is required")
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Enter valid 10 digit phone number"
    )
    private String phoneNumber;
}