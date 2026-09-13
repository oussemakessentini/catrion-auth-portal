package com.catrion.auth_portal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;


    @Test
    void shouldRegisterUser() throws Exception {

        String email = uniqueEmail("register");

        String requestBody = """
                {
                  "fullName": "Test User",
                  "email": "%s",
                  "password": "Password123!"
                }
                """.formatted(email);

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_USER"));
    }


    @Test
    void shouldLoginUser() throws Exception {

        String email = uniqueEmail("login");

        registerUser(
                "Login User",
                email
        );

        String requestBody = """
                {
                  "email": "%s",
                  "password": "Password123!"
                }
                """.formatted(email);

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.fullName").value("Login User"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_USER"));
    }


    @Test
    void shouldRejectInvalidCredentials() throws Exception {

        String requestBody = """
                {
                  "email": "invalid-%s@example.com",
                  "password": "WrongPassword123!"
                }
                """.formatted(UUID.randomUUID());

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isUnauthorized());
    }


    @Test
    void shouldAccessProfileWithValidJwt() throws Exception {

        String email = uniqueEmail("profile");

        String token = registerAndGetToken(
                "Profile User",
                email
        );

        mockMvc.perform(
                        get("/api/user/profile")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.fullName").value("Profile User"))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_USER"));
    }


    @Test
    void shouldRejectProfileWithoutJwt() throws Exception {

        mockMvc.perform(
                        get("/api/user/profile")
                )
                .andExpect(status().isUnauthorized());
    }


    @Test
    void normalUserShouldNotAccessAdminUsers() throws Exception {

        String email = uniqueEmail("normal");

        String token = registerAndGetToken(
                "Normal User",
                email
        );

        mockMvc.perform(
                        get("/api/admin/users")
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(status().isForbidden());
    }


    @Test
    void shouldRejectInvalidRegistration() throws Exception {

        String requestBody = """
                {
                  "fullName": "",
                  "email": "invalid-email",
                  "password": "123"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }


    @Test
    void shouldRejectDuplicateEmail() throws Exception {

        String email = uniqueEmail("duplicate");

        registerUser(
                "First User",
                email
        );

        String requestBody = """
                {
                  "fullName": "Second User",
                  "email": "%s",
                  "password": "Password123!"
                }
                """.formatted(email);

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.message")
                                .value("Email is already registered")
                );
    }


    private void registerUser(
            String fullName,
            String email
    ) throws Exception {

        String requestBody = """
                {
                  "fullName": "%s",
                  "email": "%s",
                  "password": "Password123!"
                }
                """.formatted(
                fullName,
                email
        );

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isCreated());
    }


    private String registerAndGetToken(
            String fullName,
            String email
    ) throws Exception {

        String requestBody = """
                {
                  "fullName": "%s",
                  "email": "%s",
                  "password": "Password123!"
                }
                """.formatted(
                fullName,
                email
        );

        String response = mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);

        return json.get("accessToken").asText();
    }


    private String uniqueEmail(String prefix) {

        return prefix
                + "-"
                + UUID.randomUUID()
                + "@example.com";
    }
}